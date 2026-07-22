import './sync.less';
const App: React.FC = () => {
  return (
    <>
      <div className="di-network-config-panel-header">
        <div className="di-network-status">
          <span style={{fontSize: 13, fontWeight: 500}}>来源&nbsp;&nbsp;</span>
          <div className="di-arrow-right" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="di-arrow-right-circle"></div>
            <div className="di-arrow-right-line"></div>
            <div className="di-arrow-right-triangle"></div>
            <div className="di-arrow-right-content"></div>
          </div>

          <span style={{fontSize: 13, fontWeight: 500}}>&nbsp;&nbsp;去向</span>
        </div>
        <div className="di-network-message"></div>
      </div>
    </>
  );
};

export default App;
