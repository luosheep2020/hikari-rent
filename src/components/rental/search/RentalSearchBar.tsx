import { useState, type SubmitEvent } from 'react';
import { Button, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import styles from './css/RentalSearchBar.module.css';

type Props = {
  initialKeyword?: string;
  onSearch: (keyword: string) => void;
};

export default function RentalSearchBar({
                                          initialKeyword = '',
                                          onSearch,
                                        }: Props) {
  const [keyword, setKeyword] = useState(initialKeyword);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();

    setKeyword(trimmedKeyword);
    onSearch(trimmedKeyword);
  };

  const handleClear = () => {
    setKeyword('');
    onSearch('');
  };

  return (
    <form
      role="search"
      aria-label="物件名で検索"
      onSubmit={handleSubmit}
      className={styles.searchBar}
    >
      <Input
        value={keyword}
        onChange={(event) => {
          setKeyword(event.target.value);
        }}
        onClear={handleClear}
        prefix={<SearchOutlined />}
        placeholder="物件名を入力して検索"
        aria-label="物件名"
        allowClear
        maxLength={100}
        size="large"
        className={styles.input}
      />

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        icon={<SearchOutlined />}
        className={styles.searchButton}
      >
        検索する
      </Button>
    </form>
  );
}
