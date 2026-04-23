/**
 * Requirements Routes
 * Handles requirements refinement and description expansion API endpoints
 */

// Declare process variable (needed in ES Module environment)
const process = globalThis.process || { env: {} };

/**
 * Register requirements routes
 * @param {object} app - Express app instance
 */
export function registerRequirementsRoutes(app) {
  // ===== AI Requirements Refinement API =====
  app.post('/api/refine-requirements', async (req, res) => {
    try {
      const { params, language } = req.body;
      
      if (!params) {
        return res.status(400).json({ success: false, error: 'Missing parameters' });
      }
  
      // Directly proxy to Pages Functions
      const baseUrl = process.env.AI_PROXY_BASE_URL || 'https://daily-0-0-1.ai-component-generator.pages.dev';
      const proxyUrl = `${baseUrl}/api/refine-requirements`;
  
      console.log('🤖 Proxying requirements refinement request to Pages Functions:', {
        url: proxyUrl,
        env: process.env.NODE_ENV || 'development',
        language: language || 'en'
      });
  
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ params, language }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pages Functions request failed: ${response.status} ${errorText}`);
      }
  
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error('Requirements refinement failed:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
  
  // ===== AI Description Expansion API =====
  app.post('/api/expand-description', async (req, res) => {
    try {
      const { description, componentName, language } = req.body;
      
      if (!description) {
        return res.status(400).json({ success: false, error: 'Missing description content' });
      }
  
      // Directly proxy to Pages Functions
      const baseUrl = process.env.AI_PROXY_BASE_URL || 'https://daily-0-0-1.ai-component-generator.pages.dev';
      const proxyUrl = `${baseUrl}/api/expand-description`;
  
      console.log('🤖 Proxying expansion request to Pages Functions:', {
        url: proxyUrl,
        env: process.env.NODE_ENV || 'development',
        language: language || 'en'
      });
  
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description, componentName, language }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pages Functions request failed: ${response.status} ${errorText}`);
      }
  
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error('Expansion failed:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
