'use client';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

import { Button, Divider, Modal } from 'antd';
import EmojiPickerInner from './Inner';
import ImageInput, { OnImageInput } from '../app-icon-picker/ImageInput';
import { Area } from 'react-easy-crop';
import getCroppedImg, { useLocalFileUploader } from '../app-icon-picker/utils';

export type AppIconEmojiSelection = {
  type: 'emoji';
  icon: string;
  background: string;
};

export type AppIconImageSelection = {
  type: 'image';
  fileId: string;
  url: string;
};

export enum TransferMethod {
  all = 'all',
  local_file = 'local_file',
  remote_url = 'remote_url',
}

export type ImageFile = {
  type: TransferMethod
  _id: string
  fileId: string
  file?: File
  progress: number
  url: string
  base64Url?: string
  deleted?: boolean
}

export type AppIconSelection = AppIconEmojiSelection | AppIconImageSelection;

type AppIconPickerProps = {
  onSelect?: (payload: AppIconSelection) => void;
  onClose?: () => void;
  className?: string;
};

type AppIconType = 'image' | 'emoji';

const EmojiPicker: FC<AppIconPickerProps> = ({ onSelect, onClose, className }) => {
  const [uploading, setUploading] = useState<boolean>();
  const [emoji, setEmoji] = useState<{ emoji: string; background: string }>();
  const [activeTab, setActiveTab] = useState<AppIconType>('emoji');

  const handleButtonClick = (buttonType) => {
    setActiveTab(buttonType);
  };

  const handleSelectEmoji = useCallback(
    (emoji: string, background: string) => {
      setEmoji({ emoji, background });
    },
    [setEmoji],
  );

  type InputImageInfo = { file: File } | { tempUrl: string; croppedAreaPixels: Area; fileName: string }
  const [inputImageInfo, setInputImageInfo] = useState<InputImageInfo>()

  const handleImageInput: OnImageInput = async (isCropped: boolean, fileOrTempUrl: string | File, croppedAreaPixels?: Area, fileName?: string) => {
    setInputImageInfo(
      isCropped
        ? { tempUrl: fileOrTempUrl as string, croppedAreaPixels: croppedAreaPixels!, fileName: fileName! }
        : { file: fileOrTempUrl as File },
    )
  }

  const { handleLocalFileUpload } = useLocalFileUploader({
    limit: 3,
    disabled: false,
    onUpload: (imageFile: ImageFile) => {
      if (imageFile.fileId) {
        setUploading(false)
        onSelect?.({
          type: 'image',
          fileId: imageFile.fileId,
          url: imageFile.url,
        })
      }
    },
  })

  const handleSelect = async () => {
    if (activeTab === 'emoji') {

      if (emoji) {
        onSelect?.({
          type: 'emoji',
          icon: emoji.emoji,
          background: emoji.background,
        });
      }
    } else {
      if (!inputImageInfo)
        return
      setUploading(true)
      if ('file' in inputImageInfo) {
        handleLocalFileUpload(inputImageInfo.file)
        return
      }
      const blob = await getCroppedImg(inputImageInfo.tempUrl, inputImageInfo.croppedAreaPixels, inputImageInfo.fileName)
      const file = new File([blob], inputImageInfo.fileName, { type: blob.type })
      handleLocalFileUpload(file)
    }
  };

  return true ? (
    <Modal
      onClose={() => {
        onClose && onClose();
      }}
      // isShow
      visible={true}
      style={{ top: 10 }}
      width={360}
      closable={false}
      centered
      rootClassName="custom-modal-root"
      footer={null}
      maskStyle={{ background: '#10182899' }} // 自定义遮罩样式
    >
      <div>
        <div style={{ padding: '0.5rem', width: '100%', paddingBottom: 0 }}>
          <div
            style={{
              padding: '0.25rem',
              borderRadius: '0.75rem',
              gap: '0.5rem',
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              backgroundColor: '#f2f4f7',
            }}
          >
            <button
              style={{
                fontWeight: 500,
                fontSize: '0.875rem',
                lineHeight: '1.25rem',
                padding: '0.5rem',
                borderRadius: '0.75rem',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
                flex: '1 1 %0',
                height: '2rem',
                display: 'flex',
                width: '48%',
                // backgroundColor: '#fcfcfd',
                backgroundColor: activeTab === 'emoji' ? '#fcfcfd' : 'rgb(242, 244, 247)',
                cursor: 'pointer',
                border: 'none',
                boxShadow:
                  activeTab === 'emoji'
                    ? '0 0 #0000, 0 0 #0000, 0px 2px 4px -2px rgba(16, 24, 40, 0.06), 0px 4px 8px -2px rgba(16, 24, 40, 0.1)'
                    : 'none',
                transition: 'background-color 0.3s, box-shadow 0.3s', // 添加过渡效果
              }}
              onClick={() => handleButtonClick('emoji')}
            >
              <span>🤖</span> &nbsp; 表情符号
            </button>

            <button
              style={{
                fontWeight: 500,
                fontSize: '0.875rem',
                lineHeight: '1.25rem',
                padding: '0.5rem',
                borderRadius: '0.75rem',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
                flex: '1 1 %0',
                height: '2rem',
                width: '48%',
                display: 'flex',
                backgroundColor: activeTab === 'image' ? '#fcfcfd' : 'rgb(242, 244, 247)',
                cursor: 'pointer',
                border: 'none',
                // boxShadow: 'none',
                boxShadow:
                  activeTab === 'image'
                    ? '0 0 #0000, 0 0 #0000, 0px 2px 4px -2px rgba(16, 24, 40, 0.06), 0px 4px 8px -2px rgba(16, 24, 40, 0.1)'
                    : 'none',
                transition: 'background-color 0.3s, box-shadow 0.3s', // 添加过渡效果
              }}
              onClick={() => handleButtonClick('image')}
            >
              <span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  data-icon="ImagePlus"
                  aria-hidden="true"
                >
                  <g id="image-plus">
                    <path
                      id="Icon"
                      d="M8.33333 2.00016H5.2C4.0799 2.00016 3.51984 2.00016 3.09202 2.21815C2.71569 2.4099 2.40973 2.71586 2.21799 3.09218C2 3.52001 2 4.08006 2 5.20016V10.8002C2 11.9203 2 12.4803 2.21799 12.9081C2.40973 13.2845 2.71569 13.5904 3.09202 13.7822C3.51984 14.0002 4.07989 14.0002 5.2 14.0002H11.3333C11.9533 14.0002 12.2633 14.0002 12.5176 13.932C13.2078 13.7471 13.7469 13.208 13.9319 12.5178C14 12.2635 14 11.9535 14 11.3335M12.6667 5.3335V1.3335M10.6667 3.3335H14.6667M7 5.66683C7 6.40321 6.40305 7.00016 5.66667 7.00016C4.93029 7.00016 4.33333 6.40321 4.33333 5.66683C4.33333 4.93045 4.93029 4.3335 5.66667 4.3335C6.40305 4.3335 7 4.93045 7 5.66683ZM9.99336 7.94559L4.3541 13.0722C4.03691 13.3605 3.87831 13.5047 3.86429 13.6296C3.85213 13.7379 3.89364 13.8453 3.97546 13.9172C4.06985 14.0002 4.28419 14.0002 4.71286 14.0002H10.9707C11.9301 14.0002 12.4098 14.0002 12.7866 13.839C13.2596 13.6366 13.6365 13.2598 13.8388 12.7868C14 12.41 14 11.9303 14 10.9708C14 10.648 14 10.4866 13.9647 10.3363C13.9204 10.1474 13.8353 9.9704 13.7155 9.81776C13.6202 9.6963 13.4941 9.59546 13.242 9.3938L11.3772 7.90194C11.1249 7.7001 10.9988 7.59919 10.8599 7.56357C10.7374 7.53218 10.6086 7.53624 10.4884 7.57529C10.352 7.61959 10.2324 7.72826 9.99336 7.94559Z"
                      stroke="currentColor"
                      stroke-width="1.25"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </g>
                </svg>
              </span>{' '}
              &nbsp; 图片
            </button>
          </div>
        </div>
      </div>

      {/* <EmojiPickerInner onSelect={handleSelectEmoji} /> */}
      <EmojiPickerInner
        display={activeTab === 'emoji' ? true : false}
        onSelect={handleSelectEmoji}
      />
      <ImageInput
        display={activeTab === 'image' ? true : false}
        onImageInput={handleImageInput}
      />
      <Divider style={{ margin: '0 0 6px 0' }} />
      <div
        style={{
          padding: '0.75rem',
          gap: '0.5rem',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          display: 'flex',
        }}
      >
        <Button
          style={{ width: '100%' }}
          onClick={() => {
            onClose && onClose();
          }}
        >
          取消
        </Button>
        <Button
          // disabled={selectedEmoji === '' || !selectedBackground}
          disabled={uploading}
          loading={uploading}
          onClick={handleSelect}
          type="primary"
          style={{ width: '100%' }}

          // onClick={() => {
          //   onSelect && onSelect(selectedEmoji, selectedBackground!);
          // }}
        >
          确认
        </Button>
      </div>
    </Modal>
  ) : (
    <></>
  );
};
export default EmojiPicker;
