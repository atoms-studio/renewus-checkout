import type { SettingsGlobalAppStoryblok } from "@typings/storyblok"
import path from "path"

export async function getPartnerSettings(partnerId: string) {
  try {
    // retrieve the partner settings JSON file from the file created at build time
    const partnerSettingsJsonFilePath = path.join(
      "partner-settings",
      `${partnerId}.json`,
    )
    const response = await fetch(partnerSettingsJsonFilePath, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data: SettingsGlobalAppStoryblok = await response
      .json()
      .catch((error) => {
        console.error("Error parsing JSON response:", error)
      })

    if (!data) {
      console.warn(`No settings found for partnerId: ${partnerId}`)
      return undefined
    }
    return data
  } catch (error) {
    console.error("Error fetching partner settings:", error)
    console.info("Returning default settings")
    return undefined
  }
}
