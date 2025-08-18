import type { SettingsGlobalAppStoryblok } from "@typings/storyblok"
import fs from "fs"
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next"
import path from "path"

// Static data store that will be populated at build time
const staticSettingsData: Record<string, SettingsGlobalAppStoryblok> = {}

type SettingsPath = {
  params: {
    partnerId: string
  }
}

const handlePathsFetchingError = (error: any) => {
  console.error("Unable to fetch partner paths: ", error)
  console.info("Returning default path for partner settings")
  return {
    paths: [
      {
        params: {
          partnerId: "whitelabel-test",
        },
      },
    ],
    fallback: false,
  }
}

async function fetchPartnerSettings(
  partnerId: string,
): Promise<SettingsGlobalAppStoryblok | null> {
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
  partnerSettings: SettingsGlobalAppStoryblok,
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

export const getStaticPaths = (async () => {
  const token = process.env.SB_TOKEN
  let paths: SettingsPath[] = []

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
      throw new Error(
        "Invalid response structure: stories not found or not an array",
      )
    }

    paths = stories.map((story: { slug: string }) => ({
      params: {
        partnerId: story.slug,
      },
    })) as SettingsPath[]
  } catch (error) {
    return handlePathsFetchingError(
      `Invalid response structure\n${JSON.stringify(error, null, 2)}`,
    )
  }

  if (paths.length === 0) {
    return handlePathsFetchingError(new Error("No paths found"))
  }

  return {
    paths,
    fallback: false,
  }
}) satisfies GetStaticPaths

export const getStaticProps = (async (context) => {
  const partnerId = context.params?.partnerId as string

  if (!partnerId) {
    return {
      props: { settings: null },
    }
  }
  // Pre-fetch settings for all partners during build time
  console.log("Pre-fetching partner settings for static export...")
  const settings = await fetchPartnerSettings(partnerId)

  if (!settings) {
    console.log(`✗ Failed to pre-fetch settings for ${partnerId}`)
    return {
      props: { settings: null },
    }
  }
  console.log(`✓ Pre-fetched settings for ${partnerId}`)

  // Write the fetched settings to a static JSON file
  writePartnerSettingsToStaticJson(partnerId, settings)

  return {
    props: {
      settings,
    },
  }
}) satisfies GetStaticProps<{
  settings: SettingsGlobalAppStoryblok | null
}>

// This component serves JSON data for static export that can be accessed like an API
export default function Page({
  settings,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // This page does not have any content. It's just needed to create the JSON files at build time.
  return ""
}
