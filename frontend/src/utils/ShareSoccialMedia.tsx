export const shareSocialMedia = async (title: string, text: string, url: string) => {
    await navigator.share({
        title: title,
        text: text,
        url: url
    });
}