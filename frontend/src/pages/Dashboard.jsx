import { useContext, useEffect, useState } from "react";
import TaskContext from "../context/TaskContext";
import DashboardNav from "../components/DashboardNav";
import TaskCard from "../components/TaskCard";
import EmptyPlaceholder from "../components/EmptyPlaceholder";
import { toast } from "react-toastify";
import { useDebounce } from "../hooks/useDebounce";
import { Pagination } from "react-bootstrap";

const Dashboard = () => {
  const { state, fetchTasks, fetchAllTasks, deleteTask, updateTask, toggleTaskCompletion, } = useContext(TaskContext);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [availableCategories, setAvailableCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(search, 1000);

  useEffect(() => {
    fetchTasks({ page: currentPage, search: debouncedSearch, filter, category: selectedCategory || null });
  }, [currentPage, filter, debouncedSearch, selectedCategory]);
  
  
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
    fetchTasks({ page: currentPage, search, filter, category: catId });
    setCurrentPage(1);
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
    fetchTasks({ page: currentPage, search: query, filter, category: selectedCategory || null });
    setCurrentPage(1);
  }
  const handleFilter = (filterType) => {
    setFilter(filterType);
    setSearch("");
    setSelectedCategory("");
    fetchTasks({ page: currentPage, search, filter: filterType, category:"" });
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!state.loading && state.tasks.length === 0 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [state.tasks, state.loading]);

  const totalPages = Math.ceil(state.count / 10);
/*
  const handlePageChange = (direction) => {
    const newPage = direction === "next" ? state.page + 1 : state.page - 1;
    fetchTasks({ page: newPage, search, filter });
  };
*/
  //if (state.loading) return <Loader />;
  if (state.error) return <p className="text-danger">{state.error}</p>;

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="container py-3">
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
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                      <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />

                      {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item
                          key={index + 1}
                          active={currentPage === index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}

                      <Pagination.Next
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                  </div>
                )}
              {/*  
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
              </div> */}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
