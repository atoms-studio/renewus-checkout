import type { SettingsGlobalAppStoryblok } from "@typings/storyblok"
import fs from "fs"
import { mapPartnerSettingsWithDefaults } from "utils/mapPartnerSettingsWithDefaults"
import path from "path"
import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config({ path: [path.resolve(process.cwd(), '.env.local'), path.resolve(process.cwd(), '.env')] })

/**
 * Prints an error message and makes sure that at least one default path is returned.
 * @param error 
 * @returns 
 */
const handlePathsFetchingError = (error: any) => {
  console.error("Unable to fetch partner paths: ", error)
  console.info("Using default partner path")
  return ["whitelabel-test"]
}

const fetchPartnerSettings = async (
  partnerId: string,
): Promise<SettingsGlobalAppStoryblok | null> =>{
  const token = process.env.SB_TOKEN

  if (!token) {
    console.error("Missing SB_TOKEN environment variable")
    return null
  }

  const isProduction = process.env.NODE_ENV === "production"
  const deliveryId = "_settings"
  const url = `https://api-us.storyblok.com/v2/cdn/stories/${partnerId}/${deliveryId}?token=${token}&version=${isProduction ? "published" : "draft"}`

  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      console.error(
        `Failed to fetch settings for ${partnerId}: ${response.status}`,
      )
      return null
    }

    const json = await response.json()
    return json?.story?.content || null
  } catch (error) {
    console.error(`Error fetching Storyblok settings for ${partnerId}:`, error)
    return null
  }
}

const writePartnerSettingsToStaticJson = (
  partnerId: string,
  partnerSettings: PartnerSettings,
) => {
  const settingsDir = path.join(process.cwd(), "public", "partner-settings")
  const fileName = path.join(`${partnerId}.json`)

  if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true })
  }
  fs.writeFileSync(
    path.join(settingsDir, fileName),
    JSON.stringify(partnerSettings, null, 2),
  )
  if (!fs.existsSync(path.join(settingsDir, fileName))) {
    console.error(`Failed to write settings for ${partnerId} to static JSON`)
  } else {
    console.info(`✓ Wrote settings for ${partnerId} to static JSON`)
  }
}

const getPartnersList = async () => {
  const token = process.env.SB_TOKEN
  let paths: string[] = []

  if (!token) {
    return handlePathsFetchingError(new Error("Missing token env"))
  }

  const isProduction = process.env.NODE_ENV === "production"
  const response = await fetch(
    `https://api-us.storyblok.com/v2/cdn/stories?token=${token}&content_type=Homepage&version=${isProduction ? "published" : "draft"}`,
  )

  if (!response.ok) {
    return handlePathsFetchingError(
      `\n${JSON.stringify(response.statusText, null, 2)}`,
    )
  }

  try {
    const responseData = await response.json()
    const stories = responseData.stories

    if (!stories || !Array.isArray(stories)) {
      return handlePathsFetchingError(
        new Error("Stories not found or not an array"),
      )
    }

    if (stories.length === 0) {
      return handlePathsFetchingError(new Error("No paths found"))
    }

    paths = stories.map((story: { slug: string }) => story.slug)
  } catch (error) {
    return handlePathsFetchingError(
      `Invalid response structure\n${JSON.stringify(error, null, 2)}`,
    )
  }

  return paths
}

const servePartnerSettingsFiles = async () => {
    const partnersList = await getPartnersList()

    for (const partnerId of partnersList) {
        const settings = await fetchPartnerSettings(partnerId)
        
        if (settings) {
            //map settings at build time, in order to only save essential data
            const mappedSettings = mapPartnerSettingsWithDefaults(settings)
            writePartnerSettingsToStaticJson(partnerId, mappedSettings)
        } else {
            console.error(`Failed to fetch settings for ${partnerId}`)
        }
    }
}

servePartnerSettingsFiles()
