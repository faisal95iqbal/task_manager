
const EmptyPlaceholder = () => {
  return (
    <div className="text-center my-5">
      <img
        src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
        alt="No tasks illustration"
        style={{ width: "150px", marginBottom: "20px" }}
      />
      <h4>No tasks found</h4>
      <p>Start by adding your first task to stay organized.</p>
    </div>
  );
};

export default EmptyPlaceholder;
