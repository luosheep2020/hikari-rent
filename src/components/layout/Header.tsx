"use client";
import Link from 'next/link';
import {App, Dropdown, type MenuProps} from 'antd';
import {usePathname} from 'next/navigation';
import {useAuthStore} from '@/stores/useAuthStore';
import {DownOutlined, HistoryOutlined, MessageOutlined} from '@ant-design/icons';
import {useRouter} from 'next/navigation';
import {HomeOutlined, HeartOutlined, UserOutlined} from '@ant-design/icons';
import styles from './Header.module.css';

const navigation = [
  {href: '/rentals', label: 'お部屋探し'},
  {href: '/map', label: '地図から探す'},
];
export default function Header() {

  const pathname = usePathname();
  const isHome = pathname === '/';
  const router = useRouter();
  const {message} = App.useApp();
  const user = useAuthStore((state) => state.user);
  const openLogin = useAuthStore((state) => state.openLogin);
  const logout = useAuthStore((state) => state.logout);

  const accountMenu: MenuProps['items'] = [
    {
      key: 'account',
      label: 'マイページ',
      icon: <UserOutlined/>,
    },
    {
      key: 'messages',
      label: 'メッセージ',
      icon: <MessageOutlined/>,
    },
    {
      key: 'favorites',
      label: 'お気に入り',
      icon: <HeartOutlined/>,
    },
    {
      key: 'history',
      label: '閲覧履歴',
      icon: <HistoryOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'ログアウト',
      danger: true,
    },
  ];

  const handleAccountMenuClick: MenuProps['onClick'] = ({key}) => {
    if (key === 'account') {
      router.push('/account');
    } else if (key === 'messages') {
      router.push('/account?tab=messages');
    } else if (key === 'history') {
      router.push('/account?tab=history');
    }else if (key === 'favorites') {
      router.push('/favorites');
    } else if (key === 'logout') {
      logout();
      message.success('ログアウトしました');
      router.replace('/');
    }
  };
  return <header
    className={`${styles.header} ${
      isHome ? styles.homeHeader : ''
    }`}
  >
    <div className={styles.inner}>
      <Link href="/" className={styles.brand}><HomeOutlined/> Hikari Rent</Link>
      <span className={styles.tagline}>くらしに、ひかりを。</span>
      <nav className={styles.navigation} aria-label="メインナビゲーション">
        {navigation.map(item => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return <Link key={item.href} href={item.href}
                       className={`${styles.navLink} ${active ? styles.active : ''}`}
                       aria-current={active ? 'page' : undefined}>{item.label}</Link>;
        })}
      </nav>
      {user ? (
        <Dropdown
          menu={{
            items: accountMenu,
            onClick: handleAccountMenuClick,
          }}
          trigger={['hover', 'click']}
          placement="bottomRight"
        >
          <button
            type="button"
            className={styles.login}
            aria-label="アカウントメニュー"
          >
            <UserOutlined/>
            <span>マイページ</span>
            <DownOutlined className={styles.dropdownArrow}/>
          </button>
        </Dropdown>
      ) : (
        <button
          type="button"
          className={styles.login}
          onClick={() => openLogin()}
        >
          <UserOutlined/>
          <span>ログイン</span>
        </button>
      )}
    </div>
  </header>;
}
