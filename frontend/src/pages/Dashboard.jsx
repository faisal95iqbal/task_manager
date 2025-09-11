import { useContext, useEffect, useState } from "react";
import TaskContext from "../context/TaskContext";
import DashboardNav from "../components/DashboardNav";
import TaskCard from "../components/TaskCard";
import EmptyPlaceholder from "../components/EmptyPlaceholder";
import { toast } from "react-toastify";
import { useDebounce } from "../hooks/useDebounce";
import Loader from "../components/Loader";

const Dashboard = () => {
  const { state, fetchTasks, fetchAllTasks, deleteTask, updateTask, toggleTaskCompletion, } = useContext(TaskContext);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [availableCategories, setAvailableCategories] = useState([]);

  const debouncedSearch = useDebounce(search, 1000);

  useEffect(() => {
    fetchTasks({ page: 1, search: debouncedSearch, filter, category: selectedCategory || null });
  }, [filter, debouncedSearch, selectedCategory]);
  
  
  // ✅ Sync available categories whenever allTasks/categories change
  useEffect(() => {
    if (state.allTasks.length > 0 && state.categories.length > 0) {
      const usedCatIds = [
        ...new Set(state.allTasks.map((t) => Number(t.category)).filter(Boolean)),
      ];
      const filtered = state.categories.filter((c) =>
        usedCatIds.includes(c.id)
      );
      setAvailableCategories(filtered);
    }
  }, [state.allTasks, state.categories]);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId || null);
    fetchTasks({ page: 1, search, filter, category: catId });
  };


  // --- EDIT TASK ---
  const handleEdit = async (task) => {
    try {
      await updateTask(task.id, task); // PUT/PATCH /tasks/:id/
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task.");
    }
  };

  // --- DELETE TASK ---
  const handleDelete = async (id) => {
    try {
      await deleteTask(id); // DELETE /tasks/:id/
      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    }
  };


  // --- TOGGLE COMPLETE ---
  const handleToggleComplete = async (task) => {
    try {
      await toggleTaskCompletion(task.id, task.completed); // PATCH /tasks/:id/
      toast.success(
        `Task marked as ${!task.completed ? "completed ✅" : "pending ⏳"}`
      );
    } catch (error) {
      console.error("Error toggling completion:", error);
      toast.error("Failed to update task status.");
    }
  };

  const handleSearch = (query) => {
    setSearch(query);
    fetchTasks({ page: 1, search: query, filter, category: selectedCategory || null });
  }
  const handleFilter = (filterType) => {
    setFilter(filterType);
    setSearch("");
    setSelectedCategory("");
    fetchTasks({ page: 1, search, filter: filterType, category:"" });
  };

  const handlePageChange = (direction) => {
    const newPage = direction === "next" ? state.page + 1 : state.page - 1;
    fetchTasks({ page: newPage, search, filter });
  };

  //if (state.loading) return <Loader />;
  if (state.error) return <p className="text-danger">{state.error}</p>;

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="container">
        <DashboardNav onSearch={handleSearch} currentSearch={search} onFilter={handleFilter} currentFilter={filter} selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} categories={availableCategories} />
        <main className="flex-grow-1 py-4">
          {state.tasks.length === 0 ? (
            <EmptyPlaceholder />
          ) : (
            <>
              <div className="row g-4">
                {state.tasks.map((task) => (
                  <div className="col-md-6 col-lg-4" key={task.id}>
                    <TaskCard
                      task={task}
                      categories={state.categories}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleComplete={handleToggleComplete}
                    />
                  </div>
                ))}
              </div>
              {/* ✅ Pagination */}
              <div className="d-flex justify-content-center mt-4">
                <nav>
                  <ul className="pagination">
                    <li className={`page-item ${!state.previous ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange("prev")}
                        disabled={!state.previous}
                      >
                        Previous
                      </button>
                    </li>
                    <li className="page-item disabled">
                      <span className="page-link">{state.page}</span>
                    </li>
                    <li className={`page-item ${!state.next ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange("next")}
                        disabled={!state.next}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
