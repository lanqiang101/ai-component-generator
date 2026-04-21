import { onRequestPost as __api_expand_description_ts_onRequestPost } from "/Users/xuyongqiang/Desktop/xm/ai-component-generator/functions/api/expand-description.ts"
import { onRequestPost as __api_generate_ts_onRequestPost } from "/Users/xuyongqiang/Desktop/xm/ai-component-generator/functions/api/generate.ts"
import { onRequestPost as __api_refine_requirements_ts_onRequestPost } from "/Users/xuyongqiang/Desktop/xm/ai-component-generator/functions/api/refine-requirements.ts"
import { onRequest as __api___path___ts_onRequest } from "/Users/xuyongqiang/Desktop/xm/ai-component-generator/functions/api/[[path]].ts"

export const routes = [
    {
      routePath: "/api/expand-description",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_expand_description_ts_onRequestPost],
    },
  {
      routePath: "/api/generate",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_generate_ts_onRequestPost],
    },
  {
      routePath: "/api/refine-requirements",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_refine_requirements_ts_onRequestPost],
    },
  {
      routePath: "/api/:path*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___path___ts_onRequest],
    },
  ]