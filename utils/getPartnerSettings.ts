import { SettingsGlobalAppStoryblok } from "@typings/storyblok";
import path from "path";

export async function getPartnerSettings(partnerId: string) {
       try {
        const partnerSettingsJsonFilePath = path.join(process.cwd(), "public", "partner-settings", `${partnerId}.json`);
        const response = await import(partnerSettingsJsonFilePath,{ with: {type: 'json'}  });
        
        const data: SettingsGlobalAppStoryblok = response.default;
        if (!data) {
            console.warn(`No settings found for partnerId: ${partnerId}`);
            return undefined;
        }
        console.log("Fetched partner settings:", data);
        return data;
     } catch (error) {
        console.error("Error fetching partner settings:", error);
        console.info("Returning default settings");
        return undefined;
     }
   
}