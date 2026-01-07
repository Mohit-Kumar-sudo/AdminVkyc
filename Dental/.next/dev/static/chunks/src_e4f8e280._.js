(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api,
    "appointmentsAPI",
    ()=>appointmentsAPI,
    "authAPI",
    ()=>authAPI,
    "clientsAPI",
    ()=>clientsAPI,
    "dashboardAPI",
    ()=>dashboardAPI,
    "patientsAPI",
    ()=>patientsAPI,
    "usersAPI",
    ()=>usersAPI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
const API_URL = ("TURBOPACK compile-time value", "http://localhost:8080/api") || 'http://localhost:5000/api';
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});
api.interceptors.request.use((config)=>{
    if ("TURBOPACK compile-time truthy", 1) {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = "Bearer ".concat(token);
        }
    }
    return config;
}, (error)=>Promise.reject(error));
api.interceptors.response.use((response)=>response, (error)=>{
    var _error_response, _error_config;
    const status = (_error_response = error.response) === null || _error_response === void 0 ? void 0 : _error_response.status;
    const url = ((_error_config = error.config) === null || _error_config === void 0 ? void 0 : _error_config.url) || '';
    if (status === 401) {
        // Allow login/register to surface API error messages without redirecting
        const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
        if (isAuthEndpoint) {
            return Promise.reject(error);
        }
        if ("TURBOPACK compile-time truthy", 1) {
            const hasToken = !!localStorage.getItem('token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Avoid redirect loop if already on login
            if (hasToken && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
    }
    return Promise.reject(error);
});
const authAPI = {
    login: (email, password)=>api.post('/auth/login', {
            email,
            password
        }),
    register: (name, email, password)=>api.post('/auth/register', {
            name,
            email,
            password
        })
};
const patientsAPI = {
    list: (params)=>api.get('/patients', {
            params
        }),
    get: (id)=>api.get("/patients/".concat(id)),
    create: (data)=>api.post('/patients', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }),
    update: (id, data)=>api.put("/patients/".concat(id), data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }),
    delete: (id)=>api.delete("/patients/".concat(id)),
    addMonthlyTreatment: (id, data)=>api.post("/patients/".concat(id, "/monthly-treatment"), data),
    updateMonthlyTreatment: (patientId, recordId, data)=>api.put("/patients/".concat(patientId, "/monthly-treatment/").concat(recordId), data),
    deleteMonthlyTreatment: (patientId, recordId)=>api.delete("/patients/".concat(patientId, "/monthly-treatment/").concat(recordId))
};
const appointmentsAPI = {
    list: (params)=>api.get('/appointments', {
            params
        }),
    get: (id)=>api.get("/appointments/".concat(id)),
    create: (data)=>api.post('/appointments', data),
    update: (id, data)=>api.put("/appointments/".concat(id), data),
    delete: (id)=>api.delete("/appointments/".concat(id))
};
const dashboardAPI = {
    summary: ()=>api.get('/dashboard/doctor')
};
const clientsAPI = {
    list: ()=>api.get('/clients'),
    get: (id)=>api.get("/clients/".concat(id)),
    create: (data)=>api.post('/clients', data),
    update: (id, data)=>api.patch("/clients/".concat(id), data),
    delete: (id)=>api.delete("/clients/".concat(id))
};
const usersAPI = {
    list: (params)=>api.get('/users', {
            params
        }),
    create: (data)=>api.post('/users', data),
    update: (id, data)=>api.patch("/users/".concat(id), data)
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider(param) {
    let { children } = param;
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [token, setToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
            setIsLoading(false);
        }
    }["AuthProvider.useEffect"], []);
    const login = async (email, password)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authAPI"].login(email, password);
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    };
    const register = async (name, email, password)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authAPI"].register(name, email, password);
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    };
    const logout = ()=>{
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            token,
            login,
            register,
            logout,
            isLoading
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/AuthContext.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "mX4/AXRUN66G8j/NKXHYWKblzjI=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_e4f8e280._.js.map