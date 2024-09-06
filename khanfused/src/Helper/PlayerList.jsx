import bread from '../Assets/bread.svg';
import './PlayerList.css';

function GrainList({ grain }) {

  return (
    <div className="grain">
      <div className="grain-item">
        <img src={bread} alt="grain" />
        <span className="grain-text">{grain}</span>
      </div>
    </div>
  );
}

export default GrainList;
