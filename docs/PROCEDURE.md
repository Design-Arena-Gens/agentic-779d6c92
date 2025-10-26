## Nova AI Assistant – Step-by-Step Procedure

1. **Install dependencies**  
   ```bash
   npm install
   ```

2. **Configure environment for hybrid online mode (optional)**  
   Create an `.env.local` file at the project root and add your OpenAI key:
   ```bash
   OPENAI_API_KEY=sk-...
   ```

3. **Run the development server**  
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` to access Nova.

4. **Use the assistant**  
   - Spawn threads in offline or hybrid mode.  
   - Offline mode mines the embedded knowledge base.  
   - Hybrid mode calls OpenAI and gracefully falls back to offline intelligence.

5. **Build for production**  
   ```bash
   npm run build
   npm start
   ```

6. **Deploy to Vercel**  
   Ensure the `VERCEL_TOKEN` environment variable is available, then run:
   ```bash
   vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-779d6c92
   ```

7. **Validate deployment**  
   After a short delay, verify the production site:
   ```bash
   curl https://agentic-779d6c92.vercel.app
   ```
