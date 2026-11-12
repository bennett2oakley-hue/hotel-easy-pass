import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import AISettingsScreen from "./src/screens/AISettingsScreen";

const features = [
  "Traveler trip dashboard",
  "Trip purpose and traveler preferences",
  "Saved places, trip notes and packing",
  "Hotel-owner property workspace",
  "Promotions and guest offers"
];

export default function App() {
  const [settings, setSettings] = useState(false);
  if (settings) return <AISettingsScreen onBack={() => setSettings(false)} />;
  return <SafeAreaView style={s.safe}><StatusBar style="dark" /><ScrollView contentContainerStyle={s.page}>
    <Text style={s.kicker}>TRAVEL COMPANION</Text><Text style={s.title}>Hotel Easy Pass</Text>
    <Text style={s.body}>A simpler trip companion for travelers and a practical workspace for hotel operators.</Text>
    <View style={s.card}><Text style={s.heading}>Mobile modules</Text>{features.map(x=><Text key={x} style={s.item}>•  {x}</Text>)}</View>
    <TouchableOpacity style={s.button} onPress={()=>setSettings(true)}><Text style={s.buttonText}>AI provider settings</Text></TouchableOpacity>
    <Text style={s.note}>This native foundation is separate from the existing web product. No paid API is bundled.</Text>
  </ScrollView></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:"#f7f6f1"},page:{padding:24,paddingTop:40,gap:18},kicker:{color:"#56715e",fontWeight:"800",letterSpacing:2,fontSize:11},title:{fontSize:32,fontWeight:"800",color:"#20352a"},body:{fontSize:15,lineHeight:23,color:"#56635a"},card:{backgroundColor:"#fff",borderRadius:18,padding:18,gap:13,borderColor:"#e2e6df",borderWidth:1},heading:{fontSize:18,fontWeight:"700",color:"#20352a"},item:{fontSize:15,color:"#35483c",lineHeight:22},button:{backgroundColor:"#24563b",padding:16,borderRadius:14,alignItems:"center"},buttonText:{color:"#fff",fontWeight:"700"},note:{fontSize:12,lineHeight:18,color:"#737d75"}});
