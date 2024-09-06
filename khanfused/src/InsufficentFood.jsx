import './InsufficentFood.css';

function InsufficentFood() {
  return (
    <div className="insufficent-food-container">
      <h1 className="fade-in-text">
        Not enough <strong className="highlight">FOOD</strong> have been <strong className="highlight">harvested</strong> for the  <strong className="highlight">KINGDOM</strong>
      </h1>
      <h2>The <strong className="highlight">KINGDOM</strong> have <strong className="highlight">FALLEN</strong></h2>

      <button>Leave</button>
    </div>
  );
}

export default InsufficentFood;
