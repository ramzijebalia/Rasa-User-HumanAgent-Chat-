import axios from 'axios';
import { retrievecolors } from '../../utils/APIRoutes';

// function to fetch and uodate colors in teh css file 
export const fetchColorsAndUpdateCSS = async (tenantId) => {
  try {
    const response = await axios.get(`${retrievecolors}?tenantId=${tenantId}`);
    const colors = response.data.colors;
    console.log('Fetched colors:', colors);

    // Update CSS variables with fetched colors
    document.documentElement.style.setProperty('--chat-bubble-bg-start', colors.ChatBubbleBgStart);
    document.documentElement.style.setProperty('--chat-bubble-bg-mid', colors.ChatBubbleBgMid);
    document.documentElement.style.setProperty('--chat-bubble-bg-end', colors.ChatBubbleBgEnd);
    document.documentElement.style.setProperty('--chat-background-color', colors.ChatBackgroundColor);
    document.documentElement.style.setProperty('--bot-message-bubble-color', colors.BotMsgBubbleColor);
    document.documentElement.style.setProperty('--human-message-bubble-color', colors.HumanMsgBubbleColor);
    document.documentElement.style.setProperty('--user-message-bubble-color', colors.UserMsgBubbleColor);
    document.documentElement.style.setProperty('--user-bot-message-text-color', colors.UserBotMsgTextColor);
    document.documentElement.style.setProperty('--chat-window-border-color', colors.ChatWindowBorderColor);
    document.documentElement.style.setProperty('--chat-window-color', colors.ChatWindowColor);
    document.documentElement.style.setProperty('--form-container-color', colors.FormContainerColor);
    document.documentElement.style.setProperty('--form-userInfo-color', colors.FormUserInfoColor);
    document.documentElement.style.setProperty('--form-container-text-color', colors.FormContainerTextColor);

    // Store colors in local storage
    localStorage.setItem('colors', JSON.stringify(colors));

  } catch (error) {
    console.error('Error fetching colors:', error);
  }
};
