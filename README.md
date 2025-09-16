# 🍳 MyOnlinePantry  

**Discover recipes you can actually cook with what you already have.**  

MyOnlinePantry helps you turn pantry ingredients into delicious meals. Just keep track of what you own, and the app will suggest recipes with detailed instructions and cooking videos so you never run out of ideas in the kitchen.  



## 🌐 Live Demo  

👉 [Visit MyOnlinePantry](https://my-online-pantry.vercel.app/)   



## ✨ Features  

- 🥫 **Pantry Tracking** – Add, edit, and remove items to keep your pantry up to date  
- 🍴 **Smart Recipe Suggestions** – Get personalized recipes powered by **Gemini AI**  
- 📖 **Step-by-Step Cooking Guides** – Access full recipe pages with clear instructions  
- ▶️ **Cooking Videos** – Watch tutorials pulled from YouTube via the **Google YouTube Data API**  
- 🎨 **Smooth Experience** – Clean, animated UI for a modern feel  



## 🛠️ Built With  

- **Next.js + React** – Core framework and UI  
- **MongoDB** – Pantry data storage  
- **Firebase Auth** – User authentication  
- **GSAP** – UI animations  
- **Gemini API** – Recipe search and suggestions  
- **Google YouTube Data API** – Fetching cooking tutorial videos  


## 🚀 Development Setup (Optional)  

If you’d like to run the project locally:  

1. Clone the repo  
```bash
git clone https://github.com/yourusername/myonlinepantry.git
cd myonlinepantry
```

2.Install dependencies
```bash
npm install
```

3. Set up environment variables in .env.local

```ini
MONGODB_URI=your_mongo_connection_string
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
GEMINI_API_KEY=your_gemini_key
YOUTUBE_API_KEY=your_youtube_data_api_key
```

4. Start the dev server
```bash
npm run dev
```

## 🤝 Contributing

Contributions are welcome! Feel free to fork, submit issues, or open pull requests.

## 📜 License

This project is licensed under the MIT License.
