/**
 * Utility to send notifications to Discord via Webhooks.
 * Requires DISCORD_WEBHOOK_URL environment variable.
 */
export async function sendDiscordNotification(content: string, embed?: any) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
        console.warn("DISCORD_WEBHOOK_URL is not set. Skipping notification.");
        return;
    }

    try {
        const payload: any = { content };
        if (embed) {
            payload.embeds = [embed];
        }

        const res = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error("Failed to send Discord notification:", await res.text());
        }
    } catch (error) {
        console.error("Error sending Discord notification:", error);
    }
}

export function formatDiscordEmbed(title: string, description: string, color: number = 0x3b82f6) {
    return {
        title,
        description,
        color,
        timestamp: new Date().toISOString(),
        footer: {
            text: "Itinero System",
        },
    };
}
