import React, { createContext, useReducer, useEffect,useState } from "react";
import { toast } from "react-toastify";
import API from "../api"; // axios instance

const TaskContext = createContext();

const initialState = {
    tasks: [],
    allTasks: [],
    categories: [],
    loading: false,
    error: null,
    page: 1,
    count: 0,
    next: null,
    previous: null,
};

function taskReducer(state, action) {
    switch (action.type) {
        case "FETCH_START":
            return { ...state, loading: true, error: null };
        case "FETCH_SUCCESS":
            return {
                ...state,
                loading: false,
                tasks: action.payload.tasks,
                count: action.payload.count,
                next: action.payload.next,
                previous: action.payload.previous,
                page: action.payload.page,
            };
        case "FETCH_ERROR":
            return { ...state, loading: false, error: action.payload };
        case "SET_LOADING":
            return { ...state, loading: true };

        case "SET_ERROR":
            return { ...state, loading: false, error: action.payload };
        case "FETCH_ALL_TASKS_SUCCESS":
            return {
                ...state,
                allTasks: action.payload,
            };
        case "ADD_TASK":
            return {
                ...state, tasks: [action.payload, ...state.tasks],
                allTasks: [action.payload, ...state.allTasks],
                count: state.count + 1,
            };
        case "UPDATE_TASK":
            return {
                ...state,
                tasks: state.tasks.map((task) =>
                    task.id === action.payload.id ? action.payload : task
                ),
                allTasks: state.allTasks.map((task) =>
                    task.id === action.payload.id ? action.payload : task
                )
            };
        case "DELETE_TASK":
            return {
                ...state,
                tasks: state.tasks.filter((task) => task.id !== action.payload),
                allTasks: state.allTasks.filter((task) => task.id !== action.payload),
                count: state.count - 1,
            };
        case "SET_CATEGORIES":
            return { ...state, categories: action.payload };
        case "ADD_CATEGORY":
            return { ...state, categories: [...state.categories, action.payload] };
        default:
            return state;
    }
}

export const TaskProvider = ({ children }) => {
    const [state, dispatch] = useReducer(taskReducer, initialState);

    // ✅ Fetch tasks with search/filter/pagination
    const fetchTasks = async ({ page = 1, search = "", filter = "all", category = null } = {}) => {
        dispatch({ type: "FETCH_START" });

        try {
            let url = "/tasks/";
            const params = { page };

            if (filter === "completed") params.completed = true;
            if (filter === "pending") params.completed = false;
            if (search) params.search = search;
            if (category) params.category = category;

            const res = await API.get(url, { params });
            const data = res.data;

            const tasks = data.results || [];
            const count = data.count ?? tasks.length;
            const next = data.next ?? null;
            const previous = data.previous ?? null;

            dispatch({
                type: "FETCH_SUCCESS",
                payload: { tasks, count, next, previous, page },
            });
        } catch (err) {
            console.error("Fetch tasks error:", err.response?.data || err.message);
            // If unauthorized, don't crash loop — let api.jsx handle redirect
            if (err.response?.status === 401) return;

            dispatch({
                type: "FETCH_ERROR",
                payload: err.response?.data || err.message,
            });
        }
    };
    // ✅ Fetch all tasks once (for categories filtering)
    const fetchAllTasks = async () => {
        try {
            const res = await API.get("/tasks/?page_size=100"); // big enough
            dispatch({ type: "FETCH_ALL_TASKS_SUCCESS", payload: res.data.results });
        } catch (err) {
            console.error("Failed to fetch all tasks", err);
            if (err.response?.status === 401) return;
        }
    };

    const addTask = async (taskData) => {
        dispatch({ type: "SET_LOADING" });

        try {
            const payload = {
                title: taskData.title,
                description: taskData.description,
                due_date: taskData.due_date || null,
                category: taskData.category ? parseInt(taskData.category, 10) : null,
            };
            const res = await API.post("/tasks/", payload);

            dispatch({ type: "ADD_TASK", payload: res.data });
            toast.success("Task added successfully!");
        } catch (err) {
            dispatch({ type: "SET_ERROR", payload: err.message });
            toast.error(`Error adding task: ${err.message}`);
            if (err.response?.status === 401) return;
        }
    };


    // ✅ Update task
    const updateTask = async (id, taskData) => {
        try {
            const res = await API.put(`/tasks/${id}/`, taskData);
            dispatch({ type: "UPDATE_TASK", payload: res.data });
        } catch (err) {
            console.error("Update Task Error:", err.response?.data || err.message);
            if (err.response?.status === 401) return;
        }
    };

    // ✅ Delete task
    const deleteTask = async (id) => {
        try {
            await API.delete(`/tasks/${id}/`);
            dispatch({ type: "DELETE_TASK", payload: id });
        } catch (err) {
            console.error("Delete Task Error:", err.response?.data || err.message);
            if (err.response?.status === 401) return;
        }
    };
    // ✅ Fetch categories
    const fetchCategories = async () => {
        try {
            const res = await API.get("/categories/");
            // If paginated
            const categories = Array.isArray(res.data) ? res.data : res.data.results;
            dispatch({ type: "SET_CATEGORIES", payload: categories });
        } catch (err) {
            console.error("Fetch Categories Error:", err.response?.data || err.message);
            if (err.response?.status === 401) return;
        }
    };
    // ✅ Add category
    const addCategory = async (categoryData) => {
        try {
            const res = await API.post("/categories/", categoryData);
            dispatch({ type: "ADD_CATEGORY", payload: res.data });
        } catch (err) {
            console.error("Add Category Error:", err.response?.data || err.message);
            if (err.response?.status === 401) return;
        }
    };
    // ✅ Toggle completion
    const toggleTaskCompletion = async (id, currentStatus) => {
        try {
            const res = await API.patch(`/tasks/${id}/`, { completed: !currentStatus });
            dispatch({ type: "UPDATE_TASK", payload: res.data });

        } catch (err) {
            console.error("Toggle Task Error:", err.response?.data || err.message);
            if (err.response?.status === 401) return;
        }
    };

    //const [token, setToken] = useState(localStorage.getItem("token"));
/*
    useEffect(() => {
        const handleStorage = () => {
            setToken(localStorage.getItem("token"));
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);
*/

    const token = localStorage.getItem("token");
    useEffect(() => {
        if (token) {
            fetchTasks();
            fetchAllTasks();
            fetchCategories();
        } else {
            // logout → clear state
            dispatch({ type: "FETCH_SUCCESS", payload: { tasks: [], count: 0, next: null, previous: null, page: 1 } });
            dispatch({ type: "FETCH_ALL_TASKS_SUCCESS", payload: [] });
            dispatch({ type: "SET_CATEGORIES", payload: [] });
        }
    }, [token]);

    return (
        <TaskContext.Provider
            value={{
                state, fetchTasks, fetchAllTasks, addTask, updateTask, deleteTask, fetchCategories,
                addCategory, toggleTaskCompletion
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};

export default TaskContext;
