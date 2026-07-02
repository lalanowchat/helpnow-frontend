import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const Chatbot = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { t, i18n } = useTranslation(); // Import i18n translation hook

  // This effect will load the chatbot
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.voiceflow.com/widget/bundle.mjs";
    script.type = "text/javascript";
    script.onload = () => {
      loadChatbot(); // Load the chatbot initially

      // Re-load the chatbot whenever the language changes
      i18n.on("languageChanged", () => {
        console.log("Language changed to:", i18n.language); 
        removeChatbot();
        loadChatbot();
      });

      // Wait for chatbot to render, then attach tooltip
      setTimeout(() => {
        const chatbotButton = document.querySelector(
          'iframe[src*="voiceflow"]'
        )?.parentElement;
        if (chatbotButton) {
          chatbotButton.style.position = "relative"; // Ensure the button is positioned relative
        }
      }, 1500);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [i18n.language]); // Re-run when language changes

  // Load or reload the chatbot with the current language
  const loadChatbot = () => {
    const selectedLanguage = i18n.language || "en"; // Get the current language

    window.voiceflow.chat.load({
      verify: { projectID: "6a4698c8d8450071a9ae6793" },
      url: "https://general-runtime.voiceflow.com",
      versionID: "production",
      assistant: {
        title: "HelpNow",
        description: t("chatbot.get_and_give_help"),
        image: "/botLogo.png",
        stylesheet: "https://helpnow.inc/chatbot-styles.css",
      },
    });
  };

  const removeChatbot = () => {
    console.log("Attempting to remove the chatbot iframe...");
  
    // Adding a small delay to allow time for the iframe to load after the language change
    setTimeout(() => {
      const iframe = document.querySelector('iframe[src*="voiceflow"]');
      console.log("Found iframe:", iframe); // Log to check if the iframe is found
  
      if (iframe) {
        console.log("Removing iframe");
        iframe.parentElement?.removeChild(iframe); // Remove the iframe element
      }
    }, 2000); // 2-second delay to ensure iframe is added to the DOM
  };
  

  const handleChatbotClick = () => {
    if (window.voiceflow && window.voiceflow.chat) {
      window.voiceflow.chat.open();
    }
    setShowTooltip(false); // Hide tooltip when chatbot opens
  };

  return (
    <>
      {showTooltip && (
        <div
          id="chatbot-tooltip"
          className="absolute bottom-16 right-0 bg-blue-500 text-white text-sm px-4 py-2 rounded-lg shadow-md animate-fadeIn"
          style={{
            position: "fixed",
            bottom: "94px",
            right: "55px",
            maxWidth: "330px",
            textAlign: "center",
            whiteSpace: "normal",
            lineHeight: "1.3",
          }}
        >
          Chat Now
            {t("needhelp.want_to_talk_with_Lala")}
          <br />
          <span style={{float: "right"}} >{t("needhelp.click_here")}</span>
          <div
            className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rotate-45"
            style={{
              position: "absolute",
              bottom: "-5px",
              left: "94%",
              transform: "translateX(-50%) rotate(45deg)",
              width: "10px",
              height: "10px",
              backgroundColor: "#3b82f6",
            }}
          ></div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
