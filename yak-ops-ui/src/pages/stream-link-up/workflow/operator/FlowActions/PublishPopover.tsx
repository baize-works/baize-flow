import { Button, Divider, Popover } from "antd";
import DownIcon from "../../icon/DownIcon";
import styles from "./index.less";
import { useIntl } from "@umijs/max";

export const PublishPopover = ({ onPublish }: any) => {
  const intl = useIntl();

  return (
    <Popover
      content={
        <div className={styles["publish-popover"]}>
          <div className={styles["latest-publish"]}>
            {intl.formatMessage({
              id: "pages.publish.latest",
              defaultMessage: "Latest Publish",
            })}
          </div>

          <div className={styles["publish-time"]}>
            {intl.formatMessage(
              {
                id: "pages.publish.timeAgo",
                defaultMessage: "Published {time} ago",
              },
              {
                time: intl.formatMessage({
                  id: "pages.publish.time.hours",
                  defaultMessage: "16 hours",
                }),
              },
            )}
          </div>

          <Button
            className={styles["update-button"]}
            type="primary"
            style={{ borderRadius: "0.5rem" }}
            onClick={() => {
              onPublish();
            }}
          >
            {intl.formatMessage({
              id: "pages.publish.publishUpdate",
              defaultMessage: "Publish & Update",
            })}
          </Button>

          <Divider className={styles.divider} />

          <div>
            <a></a>
          </div>
        </div>
      }
      trigger="click"
    >
      <Button type="primary" style={{ borderRadius: "0.5rem" }}>
        {intl.formatMessage({
          id: "pages.publish.publish",
          defaultMessage: "Publish",
        })}
        <DownIcon />
      </Button>
    </Popover>
  );
};