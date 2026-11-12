import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
const STORAGE_KEY="hotel-easy-pass.ai-provider-key";
let browserKey:string|null=null;
export async function saveAIKey(value:string){const key=value.trim();if(!key)throw new Error("Enter an API key first.");if(Platform.OS==="web"){browserKey=key;return;}await SecureStore.setItemAsync(STORAGE_KEY,key);}
export async function getAIKey(){if(Platform.OS==="web")return browserKey;return SecureStore.getItemAsync(STORAGE_KEY);}
export async function removeAIKey(){if(Platform.OS==="web"){browserKey=null;return;}await SecureStore.deleteItemAsync(STORAGE_KEY);}
