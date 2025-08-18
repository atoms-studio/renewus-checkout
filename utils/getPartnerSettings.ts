import { SettingsGlobalAppStoryblok } from "@typings/storyblok";

export async function getPartnerSettings(partnerId: string) {
       try {
        const response = await import(`/public/partner-settings/${partnerId}.json`,{ with: {type: 'json'}  });
        
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