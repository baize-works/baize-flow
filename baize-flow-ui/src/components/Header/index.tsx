import './index.less';

const Header: React.FC<{ title: any }> = ({ title }) => {
  return (
    <div className="dc-ui-title dc-ui-title-medium">
      <div className="dc-ui-title-name">
        <div className="dc-ui-title-name-content" title={title}>
          <div className="dc-ui-title-border"></div>
          {title}
        </div>
      </div>
    </div>
  );
};

export default Header;
