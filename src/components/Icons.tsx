// Line icons drawn for the store: 1.5px strokes, round joins, in the current text colour.
type P = { className?: string; title?: string };
const S = ({ children, className, title }: P & { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className={className} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
    {title && <title>{title}</title>}
    {children}
  </svg>
);
export const SearchIcon = (p: P) => <S {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></S>;
export const BagIcon = (p: P) => <S {...p}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></S>;
export const UserIcon = (p: P) => <S {...p}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5" /></S>;
export const HeartIcon = (p: P) => <S {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></S>;
export const MenuIcon = (p: P) => <S {...p}><path d="M4 8h16M4 16h16" /></S>;
export const CloseIcon = (p: P) => <S {...p}><path d="m6 6 12 12M18 6 6 18" /></S>;
export const RxIcon = (p: P) => <S {...p}><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4Z" /><path d="M14 3v4h4" /><path d="M9 11h2.5a1.5 1.5 0 0 1 0 3H9v-3Zm0 3v3m2.2-3 2.8 3" /></S>;
export const LeafIcon = (p: P) => <S {...p}><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" /><path d="M5 19 13 11" /></S>;
export const ShieldIcon = (p: P) => <S {...p}><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></S>;
export const TruckIcon = (p: P) => <S {...p}><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" /></S>;
export const ChatIcon = (p: P) => <S {...p}><path d="M4 12a8 8 0 1 1 3.3 6.5L4 20l1.3-3.6A8 8 0 0 1 4 12Z" /><path d="M9.5 9.5c0 2.8 2.2 5 5 5l1-1.2-1.6-1-.9.7a3.2 3.2 0 0 1-2-2l.7-.9-1-1.6-1.2 1Z" /></S>;
export const ArrowIcon = (p: P) => <S {...p}><path d="M5 12h14M13 6l6 6-6 6" /></S>;
export const DoctorIcon = (p: P) => <S {...p}><circle cx="12" cy="7" r="3.5" /><path d="M5 21c.8-4 3.5-6 7-6s6.2 2 7 6" /><path d="M9 15.5v2.5a2 2 0 1 0 4 0" /></S>;
export const ClockIcon = (p: P) => <S {...p}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 2.5" /></S>;
export const UploadIcon = (p: P) => <S {...p}><path d="M12 15V4m-4 4 4-4 4 4" /><path d="M5 15v4h14v-4" /></S>;
export const PrintIcon = (p: P) => <S {...p}><path d="M7 9V4h10v5M7 17H5v-6h14v6h-2" /><path d="M7 14h10v6H7z" /></S>;
