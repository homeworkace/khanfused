import React, { useState } from 'react';
import helpIcon from '../Assets/help.svg'; 
import './Instructions.css'; 

function HelpButton({role}) {
  const [isHelpOpen, setIsHelpOpen] = useState(false); 

  const toggleHelp = () => {
    setIsHelpOpen(!isHelpOpen);
  };

  const renderRoleSpecificContent = () => {
    if (role === 'lord') {
      return (
        <div className="lord-instructions">
          <div className ="lord-spring-instructions">
          <p className ="spring-lord-header">SPRING: </p>
            <p>Discuss your plans for the Summer to come.</p> 
            <p>Your final choice is a secret...</p>
          </div>
        
          <div className ="lord-summer-instructions">
          <p className="summer-lord-header">SUMMER:</p>
            <p>Choose to scout a person to find his role</p>
            <p>Or farm to provide food for the Kingdom</p>
          </div>

          <div className ="lord-autumn-instructions">
            <p className ="autumn-lord-header">AUTUMN:</p>
              <p>Talk to your fellow Lords to make deductions.</p>
              <p>Convince your King if you know the Khan!</p>
          </div>

          <div className ="lord-winter-instructions">
            <p className ="winter-lord-header">WINTER:</p>
              <p>Close your eyes and pray you are not next..</p>
          </div>
        </div>

      );
    } else if (role === 'khan') {
      return (
        <div className ="khan-instructions">
          <div className ="khan-spring-instructions">
            <p className ="spring-khan-header">SPRING:</p>
              <p>Pretend to help the Kingdom aand convince the King.</p>
          </div>
          <div className ="khan-summer-instructions">
            <p className ="summer-khan-header">SUMMER: </p>
              <p>Plan to deceive  the King.</p>
              <p>Remember that you can get chosen for double harvest and plan accordingly...</p>
          </div>
          <div className ="khan-autumn-instructions">
            <p className ="autumn-khan-header">AUTUMN: </p>
              <p>Deflect attention and frame other lords!</p>
              <p>The game ends when all Khans are banished</p>
          </div>
          <div className ="khan-winter-instructions">
            <p className ="winter-khan-header">Winter:</p>
              <p>Vote the target you wish to pillage</p>
              <p>You can choose not to pillage as a tactical strategy.</p>
          </div>
        </div>
      );
    } else if (role === 'lord') {
      return (
        <div className ="king-instructions">
          <div className ="king-spring-instructions">
            <p className ="spring-king-header">SPRING: </p>
              <p>Lead the discussion on the Lords' obligations during Summer</p>
              <p>Issue a secret order to a player to double harvest.</p>
          </div>
          <div className ="king-summer-instructions">
            <p className ="summer-king-header">SUMMER: </p>
              <p>Think about the possible outcomes...</p>
          </div>
          <div className ="king-autumn-instructions">
            <p className="autumn-king-header">AUTUMN:</p>
              <p>Listen to your Lords, and deduce who is the Khan!</p>
              <p>Choose whether to banish a person on suspiscion without knowing his role</p>
              <p>Or you can choose not to banish...</p>
          </div>
          <div className ="king-winter-instructions">
            <p className ="winter-king-header">WINTER: </p>
              <p>The harsh winter comes, and no actions can be taken...</p>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="help-button-container">
      <img
        src={helpIcon}
        alt="Help"
        className="help-icon"
        onClick={toggleHelp}
      />

      {isHelpOpen && (
        <div className="help-box">
          {renderRoleSpecificContent()}
        </div>
      )}
    </div>
  );
}
export default HelpButton;

