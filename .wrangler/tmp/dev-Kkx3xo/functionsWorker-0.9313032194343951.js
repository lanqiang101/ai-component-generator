var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-svZpOF/functionsWorker-0.9313032194343951.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
async function callAI(prompt, env) {
  const WORKER_URL = env?.AI_PROXY_URL || "https://ai-component-proxy.xuyongqiang916.workers.dev";
  console.log("\u8C03\u7528 Cloudflare Worker \u4EE3\u7406:", WORKER_URL);
  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4096
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Worker \u8BF7\u6C42\u5931\u8D25:", response.status, errorText);
      throw new Error(`Worker request failed with status ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    console.log("Worker \u54CD\u5E94\u6210\u529F");
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    console.error("Worker \u54CD\u5E94\u683C\u5F0F\u5F02\u5E38:", JSON.stringify(data));
    throw new Error("Invalid worker response format");
  } catch (error) {
    console.error("AI API call failed:", error);
    throw error;
  }
}
__name(callAI, "callAI");
__name2(callAI, "callAI");
async function onRequestPost(context) {
  try {
    const request = context.request;
    const env = context.env;
    let body;
    try {
      body = await request.json();
      console.log("\u6536\u5230\u6269\u5C55\u63CF\u8FF0\u8BF7\u6C42:", JSON.stringify(body));
    } catch (parseError) {
      console.error("\u8BF7\u6C42\u4F53\u89E3\u6790\u5931\u8D25:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "\u8BF7\u6C42\u4F53\u683C\u5F0F\u9519\u8BEF"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { description, componentName } = body;
    if (!description || !componentName) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "\u7F3A\u5C11\u5FC5\u8981\u53C2\u6570\uFF1Adescription \u548C componentName"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const prompt = `\u8BF7\u6839\u636E\u4EE5\u4E0B\u7EC4\u4EF6\u63CF\u8FF0\uFF0C\u751F\u6210\u66F4\u8BE6\u7EC6\u7684\u6280\u672F\u9700\u6C42\u6587\u6863\uFF1A

\u7EC4\u4EF6\u540D\u79F0\uFF1A${componentName}
\u7B80\u8981\u63CF\u8FF0\uFF1A${description}

\u8BF7\u63D0\u4F9B\uFF1A
1. \u8BE6\u7EC6\u7684\u529F\u80FD\u63CF\u8FF0\uFF08200-300\u5B57\uFF09
2. \u6838\u5FC3\u4EA4\u4E92\u903B\u8F91
3. \u6837\u5F0F\u8981\u6C42
4. \u6570\u636E\u7ED3\u6784\u5B9A\u4E49
5. \u8FB9\u754C\u60C5\u51B5\u5904\u7406

\u8BF7\u4EE5 JSON \u683C\u5F0F\u8FD4\u56DE\uFF0C\u5305\u542B\u4EE5\u4E0B\u5B57\u6BB5\uFF1A
- detailedDescription: \u8BE6\u7EC6\u63CF\u8FF0
- interactions: \u4EA4\u4E92\u903B\u8F91\u6570\u7EC4
- styling: \u6837\u5F0F\u8981\u6C42
- dataStructure: \u6570\u636E\u7ED3\u6784
- edgeCases: \u8FB9\u754C\u60C5\u51B5\u6570\u7EC4`;
    console.log("\u5F00\u59CB\u8C03\u7528 AI...");
    const aiResponse = await callAI(prompt, env);
    console.log("AI \u8C03\u7528\u6210\u529F\uFF0C\u539F\u59CB\u54CD\u5E94:", aiResponse.substring(0, 200));
    let expandedDescription;
    try {
      const parsedJson = JSON.parse(aiResponse);
      if (parsedJson.detailedDescription) {
        expandedDescription = parsedJson.detailedDescription;
      } else {
        expandedDescription = JSON.stringify(parsedJson, null, 2);
      }
    } catch (parseError) {
      console.log("AI \u54CD\u5E94\u4E0D\u662F JSON \u683C\u5F0F\uFF0C\u4F7F\u7528\u539F\u59CB\u6587\u672C");
      expandedDescription = aiResponse;
    }
    console.log("\u6700\u7EC8\u8FD4\u56DE\u7684\u63CF\u8FF0:", expandedDescription.substring(0, 200));
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          expandedDescription
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("\u6269\u5C55\u63CF\u8FF0\u5931\u8D25:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "AI \u670D\u52A1\u8C03\u7528\u5931\u8D25"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
async function onRequestPost2(context) {
  try {
    const request = context.request;
    const env = context.env;
    let body;
    try {
      body = await request.json();
      console.log("\u6536\u5230\u751F\u6210\u8BF7\u6C42:", JSON.stringify(body));
    } catch (parseError) {
      console.error("\u8BF7\u6C42\u4F53\u89E3\u6790\u5931\u8D25:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: "\u8BF7\u6C42\u4F53\u683C\u5F0F\u9519\u8BEF" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { params } = body;
    if (!params || !params.description) {
      return new Response(
        JSON.stringify({ success: false, error: "\u7F3A\u5C11\u5FC5\u8981\u53C2\u6570\uFF1Aparams.description" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    console.log("\u5F00\u59CB\u751F\u6210\u7EC4\u4EF6\u4EE3\u7801...");
    const prompt = `\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u524D\u7AEF\u5F00\u53D1\u5DE5\u7A0B\u5E08\uFF0C\u8BF7\u6839\u636E\u4EE5\u4E0B\u9700\u6C42\u751F\u6210\u4E00\u4E2A React \u7EC4\u4EF6\uFF1A

\u7EC4\u4EF6\u540D\u79F0: ${params.componentName || "MyComponent"}
\u7EC4\u4EF6\u7C7B\u578B: ${params.componentType || "\u901A\u7528\u7EC4\u4EF6"}
\u63CF\u8FF0: ${params.description}
\u8BBE\u8BA1\u98CE\u683C: ${params.style || "\u7B80\u7EA6\u73B0\u4EE3"}
${params.dimensions ? `\u5C3A\u5BF8\u8981\u6C42: ${params.dimensions}` : ""}
${params.uiLibrary && params.uiLibrary !== "none" ? `\u4F7F\u7528 UI \u5E93: ${params.uiLibrary}` : "\u4E0D\u4F7F\u7528\u7B2C\u4E09\u65B9 UI \u5E93"}

\u8981\u6C42\uFF1A
1. \u53EA\u8FD4\u56DE\u5B8C\u6574\u53EF\u8FD0\u884C\u7684\u7EC4\u4EF6\u4EE3\u7801\uFF0C\u4E0D\u8981\u6709\u591A\u4F59\u89E3\u91CA
2. \u4F7F\u7528 React 18 + TypeScript (TSX)
3. \u4EE3\u7801\u8981\u6574\u6D01\uFF0C\u6709\u9002\u5F53\u7684\u6CE8\u91CA
4. \u786E\u4FDD\u4EE3\u7801\u53EF\u4EE5\u76F4\u63A5\u590D\u5236\u4F7F\u7528
5. \u4F7F\u7528 React.useState\u3001React.useEffect \u7B49\u5B8C\u6574\u5F62\u5F0F
6. Mock \u6570\u636E\u8981\u5B8C\u6574

\u5F00\u59CB\u751F\u6210\u4EE3\u7801:`;
    const code = await callAI(prompt, env);
    console.log("\u7EC4\u4EF6\u4EE3\u7801\u751F\u6210\u6210\u529F");
    return new Response(
      JSON.stringify({
        success: true,
        data: { code }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("\u751F\u6210\u5931\u8D25:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "\u751F\u6210\u5931\u8D25"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
__name(onRequestPost2, "onRequestPost2");
__name2(onRequestPost2, "onRequestPost");
async function onRequestPost3(context) {
  try {
    const request = context.request;
    const env = context.env;
    let body;
    try {
      body = await request.json();
      console.log("\u6536\u5230\u9700\u6C42\u6574\u7406\u8BF7\u6C42:", JSON.stringify(body));
    } catch (parseError) {
      console.error("\u8BF7\u6C42\u4F53\u89E3\u6790\u5931\u8D25:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: "\u8BF7\u6C42\u4F53\u683C\u5F0F\u9519\u8BEF" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { params } = body;
    if (!params || !params.description) {
      return new Response(
        JSON.stringify({ success: false, error: "\u7F3A\u5C11\u5FC5\u8981\u53C2\u6570\uFF1Aparams.description" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { componentName, description, componentType, style, framework } = params;
    console.log("\u5F00\u59CB\u6574\u7406\u9700\u6C42...");
    console.log("\u7EC4\u4EF6\u540D\u79F0:", componentName);
    console.log("\u7EC4\u4EF6\u63CF\u8FF0:", description);
    const prompt = `\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u4EA7\u54C1\u7ECF\u7406\u548C\u524D\u7AEF\u67B6\u6784\u5E08\uFF0C\u8BF7\u6839\u636E\u4EE5\u4E0B\u7EC4\u4EF6\u9700\u6C42\uFF0C\u6574\u7406\u6210\u7ED3\u6784\u5316\u7684\u9700\u6C42\u6587\u6863\uFF1A

## \u57FA\u672C\u4FE1\u606F
- \u7EC4\u4EF6\u540D\u79F0\uFF1A${componentName || "\u672A\u547D\u540D\u7EC4\u4EF6"}
- \u7EC4\u4EF6\u7C7B\u578B\uFF1A${componentType || "\u901A\u7528\u7EC4\u4EF6"}
- \u6846\u67B6\uFF1A${framework || "React"}
- \u98CE\u683C\uFF1A${style || "\u7B80\u7EA6"}

## \u9700\u6C42\u63CF\u8FF0
${description}

\u8BF7\u63D0\u4F9B\u4EE5\u4E0B\u5185\u5BB9\uFF08\u5FC5\u987B\u8FD4\u56DE\u6709\u6548\u7684 JSON \u683C\u5F0F\uFF09\uFF1A

{
  "refinedDescription": "\u7528200-300\u5B57\u8BE6\u7EC6\u63CF\u8FF0\u7EC4\u4EF6\u7684\u529F\u80FD\u3001\u4EA4\u4E92\u548C\u6280\u672F\u8981\u6C42\uFF0C\u5305\u62EC\u52A0\u8F7D\u6027\u80FD\u3001\u7528\u6237\u4F53\u9A8C\u7B49",
  "componentStructure": "\u4F7F\u7528 Mermaid \u8BED\u6CD5\u751F\u6210\u7EC4\u4EF6\u7ED3\u6784\u56FE\uFF08block-beta \u6216 flowchart\uFF09\uFF0C\u5C55\u793A\u7EC4\u4EF6\u7684\u5C42\u7EA7\u5173\u7CFB\u548C\u5B50\u7EC4\u4EF6",
  "features": ["\u529F\u80FD\u70B91", "\u529F\u80FD\u70B92", "\u529F\u80FD\u70B93", "\u529F\u80FD\u70B94"],
  "prototypeDiagram": "\u4F7F\u7528 Mermaid \u7684 block-beta \u8BED\u6CD5\u751F\u6210\u539F\u578B\u793A\u610F\u56FE\uFF0C\u5C55\u793A\u7EC4\u4EF6\u7684\u5E03\u5C40\u548C\u5143\u7D20\u4F4D\u7F6E",
  "technicalNotes": ["\u6280\u672F\u8981\u70B91", "\u6280\u672F\u8981\u70B92", "\u6280\u672F\u8981\u70B93"]
}

\u6CE8\u610F\uFF1A
1. componentStructure \u548C prototypeDiagram \u5FC5\u987B\u4F7F\u7528\u5408\u6CD5\u7684 Mermaid \u8BED\u6CD5
2. features \u548C technicalNotes \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u6570\u7EC4
3. refinedDescription \u5E94\u8BE5\u5305\u542B\u6027\u80FD\u8981\u6C42\uFF08\u5982\u52A0\u8F7D\u65F6\u95F4\uFF09\u3001\u4EA4\u4E92\u7EC6\u8282\u3001\u72B6\u6001\u7BA1\u7406\u7B49\u6280\u672F\u8981\u6C42
4. \u6240\u6709\u5185\u5BB9\u90FD\u5E94\u8BE5\u4E0E\u524D\u7AEF\u7EC4\u4EF6\u5F00\u53D1\u76F4\u63A5\u76F8\u5173`;
    const aiResponse = await callAI(prompt, env);
    console.log("\u9700\u6C42\u6574\u7406\u5B8C\u6210\uFF0CAI \u539F\u59CB\u54CD\u5E94:", aiResponse.substring(0, 200));
    let refinedRequirements;
    try {
      refinedRequirements = JSON.parse(aiResponse);
      if (!refinedRequirements.refinedDescription) {
        refinedRequirements.refinedDescription = description;
      }
    } catch (parseError) {
      console.error("JSON \u89E3\u6790\u5931\u8D25:", parseError);
      refinedRequirements = {
        refinedDescription: description,
        features: [],
        technicalNotes: []
      };
    }
    console.log("\u6700\u7EC8\u8FD4\u56DE\u7684\u6570\u636E:", JSON.stringify(refinedRequirements).substring(0, 200));
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          refinedRequirements
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("\u9700\u6C42\u6574\u7406\u5931\u8D25:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "\u9700\u6C42\u6574\u7406\u5931\u8D25"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
__name(onRequestPost3, "onRequestPost3");
__name2(onRequestPost3, "onRequestPost");
async function onRequest(context) {
  const { request } = context;
  try {
    const pathname = new URL(request.url).pathname;
    const targetUrl = `https://ai-component-generator.pages.dev${pathname}`;
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? await request.clone().text() : void 0
    });
    if (pathname === "/api/generate") {
      const responseText = await response.text();
      try {
        const responseData = JSON.parse(responseText);
        if (responseData.success && responseData.data?.code) {
          let cleanedCode = responseData.data.code.trim();
          cleanedCode = cleanedCode.replace(/\\?`{3}(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\\?\n?/gi, "");
          cleanedCode = cleanedCode.replace(/^`{3}(?:tsx|typescript|javascript|jsx|vue|html|css|scss|less)?\s*\n?/i, "");
          cleanedCode = cleanedCode.replace(/\n?`{3}$/, "");
          cleanedCode = cleanedCode.trim();
          console.log("\u4EE3\u7406\u5C42\u6E05\u7406\u540E\u7684\u4EE3\u7801\u957F\u5EA6:", cleanedCode.length);
          console.log("\u4EE3\u7801\u524D100\u5B57\u7B26:", cleanedCode.substring(0, 100));
          responseData.data.code = cleanedCode;
        }
        return new Response(JSON.stringify(responseData), {
          status: response.status,
          statusText: response.statusText,
          headers: { ...Object.fromEntries(response.headers), "Content-Type": "application/json" }
        });
      } catch (parseError) {
        console.error("\u89E3\u6790\u54CD\u5E94\u5931\u8D25:", parseError);
        return new Response(responseText, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  } catch (error) {
    console.error("API \u4EE3\u7406\u9519\u8BEF:", error);
    return new Response(
      JSON.stringify({ success: false, error: "API \u670D\u52A1\u4E0D\u53EF\u7528" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
__name(onRequest, "onRequest");
__name2(onRequest, "onRequest");
var routes = [
  {
    routePath: "/api/expand-description",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/generate",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/refine-requirements",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/:path*",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-bvQJ21/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-bvQJ21/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.9313032194343951.js.map
