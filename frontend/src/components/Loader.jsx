
import { FaSpinner } from "react-icons/fa";

const Loader = ({ size = 80, color = "#493e49ff", visible = true }) => {
    return (
        <div className={`loader ${visible ? "show" : "hide"}`}>
            <FaSpinner className="modern-spinner" size={size} style={{ color }} />
        </div>
    );
};

export default Loader;
