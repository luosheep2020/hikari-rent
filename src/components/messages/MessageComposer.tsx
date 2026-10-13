import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { App, Button, Image, Input } from 'antd';
import {
  CloseOutlined,
  PictureOutlined,
  SendOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import {
  EmojiStyle,
  Theme,
  type EmojiClickData,
} from 'emoji-picker-react';

import type {
  MessageDraft,
  MessageImage,
} from '@/types/message';

import styles from './css/MessageCenter.module.css';

const EmojiPicker = dynamic(
  () => import('emoji-picker-react'),
  {
    ssr: false,
    loading: () => (
      <div className={styles.pickerLoading}>
        読み込み中...
      </div>
    ),
  },
);

type Props = {
  onSend: (draft: MessageDraft) => void;
};

const MAX_TEXT_LENGTH = 500;
const MAX_IMAGES = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function readImage(file: File): Promise<MessageImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('画像を読み込めませんでした'));
        return;
      }

      resolve({
        id: crypto.randomUUID(),
        url: reader.result,
        name: file.name,
      });
    };

    reader.onerror = () => {
      reject(new Error('画像を読み込めませんでした'));
    };

    reader.readAsDataURL(file);
  });
}

export default function MessageComposer({
                                          onSend,
                                        }: Props) {
  const { message } = App.useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiWrapperRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const readingRef = useRef(false);

  const [text, setText] = useState('');
  const [images, setImages] = useState<MessageImage[]>([]);
  const [reading, setReading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!emojiOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const wrapper = emojiWrapperRef.current;

      if (
        wrapper &&
        event.target instanceof Node &&
        !wrapper.contains(event.target)
      ) {
        setEmojiOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setEmojiOpen(false);
      }
    };

    document.addEventListener(
      'pointerdown',
      handlePointerDown,
    );
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown,
      );
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [emojiOpen]);

  const canSend =
    !reading &&
    (text.trim().length > 0 || images.length > 0);

  const handleSend = () => {
    if (!canSend) return;

    onSend({
      text: text.trim(),
      images: [...images],
    });

    setText('');
    setImages([]);
    setEmojiOpen(false);
  };

  const handleEmojiClick = (
    emojiData: EmojiClickData,
  ) => {
    if (
      text.length + emojiData.emoji.length >
      MAX_TEXT_LENGTH
    ) {
      message.warning(
        'メッセージは500文字以内にしてください',
      );
      return;
    }

    setText((current) =>
      current.length + emojiData.emoji.length <=
      MAX_TEXT_LENGTH
        ? current + emojiData.emoji
        : current,
    );
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0 || readingRef.current) return;

    const remaining = MAX_IMAGES - images.length;

    if (remaining <= 0) {
      message.warning('画像は4枚まで選択できます');
      return;
    }

    if (files.length > remaining) {
      message.warning(
        `追加できる画像は${remaining}枚までです`,
      );
    }

    const validFiles = files
      .slice(0, remaining)
      .filter((file) => {
        if (
          ![
            'image/jpeg',
            'image/png',
            'image/webp',
          ].includes(file.type)
        ) {
          message.error(
            `${file.name}：JPEG・PNG・WebPを選択してください`,
          );
          return false;
        }

        if (file.size > MAX_IMAGE_SIZE) {
          message.error(
            `${file.name}：画像は5MB以下にしてください`,
          );
          return false;
        }

        return true;
      });

    if (validFiles.length === 0) return;

    readingRef.current = true;
    setReading(true);

    try {
      const results = await Promise.allSettled(
        validFiles.map(readImage),
      );

      if (!mountedRef.current) return;

      const loadedImages: MessageImage[] = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          loadedImages.push(result.value);
        } else {
          message.error('画像を読み込めませんでした');
        }
      });

      setImages((current) =>
        [...current, ...loadedImages].slice(
          0,
          MAX_IMAGES,
        ),
      );
    } finally {
      readingRef.current = false;

      if (mountedRef.current) {
        setReading(false);
      }
    }
  };

  return (
    <div className={styles.composer}>
      {images.length > 0 && (
        <div className={styles.attachments}>
          {images.map((image) => (
            <div
              key={image.id}
              className={styles.attachment}
            >
              <Image
                src={image.url}
                alt={image.name}
                width={88}
                height={64}
                preview={false}
                className={styles.attachmentImage}
              />

              <button
                type="button"
                className={styles.removeImage}
                aria-label={`${image.name}を削除`}
                disabled={reading}
                onClick={() => {
                  setImages((current) =>
                    current.filter(
                      (item) => item.id !== image.id,
                    ),
                  );
                }}
              >
                <CloseOutlined />
              </button>
            </div>
          ))}
        </div>
      )}

      <Input.TextArea
        value={text}
        onChange={(event) => {
          setText(event.target.value);
        }}
        placeholder="メッセージを入力..."
        aria-label="メッセージ"
        maxLength={MAX_TEXT_LENGTH}
        autoSize={{ minRows: 2, maxRows: 5 }}
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing &&
            event.keyCode !== 229
          ) {
            event.preventDefault();
            handleSend();
          }
        }}
      />

      <div className={styles.composerToolbar}>
        <div className={styles.composerTools}>
          <div
            ref={emojiWrapperRef}
            className={styles.emojiWrapper}
          >
            <button
              type="button"
              className={styles.emojiTrigger}
              aria-label="絵文字を選択"
              aria-expanded={emojiOpen}
              onClick={() => {
                setEmojiOpen((current) => !current);
              }}
            >
              <SmileOutlined />
            </button>

            {emojiOpen && (
              <div className={styles.emojiPopup}>
                <div className={styles.emojiPopupHeading}>
                  <span>絵文字</span>

                  <button
                    type="button"
                    className={styles.emojiClose}
                    aria-label="絵文字パネルを閉じる"
                    onClick={() => setEmojiOpen(false)}
                  >
                    <CloseOutlined />
                  </button>
                </div>

                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme={Theme.LIGHT}
                  emojiStyle={EmojiStyle.NATIVE}
                  width="100%"
                  height={340}
                  searchPlaceholder="絵文字を検索"
                  autoFocusSearch={false}
                  previewConfig={{
                    showPreview: false,
                  }}
                />
              </div>
            )}
          </div>

          <Button
            type="text"
            icon={<PictureOutlined />}
            aria-label="画像を追加"
            loading={reading}
            disabled={
              reading || images.length >= MAX_IMAGES
            }
            onClick={() => {
              setEmojiOpen(false);
              fileInputRef.current?.click();
            }}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(event) => {
              const files = Array.from(
                event.target.files ?? [],
              );

              event.target.value = '';
              void handleFiles(files);
            }}
          />

          <span className={styles.keyboardHint}>
            Enterで送信・Shift+Enterで改行
          </span>
        </div>

        <span className={styles.characterCount}>
          {text.length}/{MAX_TEXT_LENGTH}
        </span>

        <Button
          type="primary"
          icon={<SendOutlined />}
          disabled={!canSend}
          onClick={handleSend}
        >
          送信
        </Button>
      </div>
    </div>
  );
}
