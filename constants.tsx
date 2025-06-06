
import React from 'react';
import { AppointmentType } from './types';

// Generic Icon Props
type IconProps = React.SVGProps<SVGSVGElement> & { size?: number | string };

const defaultIconProps = (props: IconProps) => ({
  width: props.size || 24,
  height: props.size || 24,
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor",
  ...props,
});

// Define Icons (using Heroicons style for consistency)
export const BirthdayIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a8.25 8.25 0 01-16.5 0V11.25a8.25 8.25 0 0116.5 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 11.25v.00833A4.126 4.126 0 0111.622 15.38a4.125 4.125 0 01-4.124-4.124V11.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 0H9.75m2.25 0H14.25M12 3A2.25 2.25 0 0114.25 5.25V7.5H9.75V5.25A2.25 2.25 0 0112 3z" />
  </svg>
);

export const DentistIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75s.168-.75.375-.75.375.336.375.75zm4.5 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" />
  </svg>
);

export const DoctorIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2.25 2.25L15 10.5" />
  </svg>
);

export const NoteTaskIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

export const TravelIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.875L5.999 12zm0 0h7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5V12m0 0V16.5m0-4.5h-1.5m1.5 0h1.5M12 7.5V12m0 0V16.5m0-4.5H10.5m1.5 0H13.5" />
  </svg>
);

export const ManicureIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 10.5l1.586 1.586a2.25 2.25 0 003.182 0l1.586-1.586M18 10.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM12 4.5v3.75m-3.75 0H12m0 0h3.75M7.5 15h9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 7.256A3 3 0 0012 6.75a3 3 0 001.95-.506M18 18.75h-12A2.25 2.25 0 013.75 16.5V9.75A2.25 2.25 0 016 7.5h12A2.25 2.25 0 0120.25 9.75v6.75A2.25 2.25 0 0118 18.75z" />
  </svg>
);

export const HairdresserIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 10.5c0-1.657 1.343-3 3-3s3 1.343 3 3M4.5 10.5h15M7.5 10.5V18m3-7.5V18m3-7.5V18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18h12M6 18a1.5 1.5 0 00-1.5 1.5v.75A2.25 2.25 0 006.75 22.5h10.5A2.25 2.25 0 0019.5 20.25v-.75A1.5 1.5 0 0018 18M10.5 3.75a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0z" />
  </svg>
);

export const SupermarketIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

export const VisitIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 9.75V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v2.25z" />
  </svg>
);

export const MedicineIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h3m-6.75 3h9.75m-1.5-3h1.5A2.25 2.25 0 0121 7.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5v-9A2.25 2.25 0 015.25 6H6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V6.75M15 9V6.75M12 12v3M9 15h6" />
  </svg>
);

export const ExerciseIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h3M9.75 6.75h4.5M12 17.25V21m0-10.5V12m0 0H9.75m2.25 0H14.25M12 12L9 9.75M12 12l3 2.25M12 12l-3 2.25m3-2.25l3-2.25M3 9.75l3-2.25M21 9.75l-3-2.25m-16.5 0h18" />
  </svg>
);

export const WorkMeetingIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.75h-12A2.25 2.25 0 013.75 16.5V6.375c0-.621.504-1.125 1.125-1.125h16.5c.621 0 1.125.504 1.125 1.125v10.125A2.25 2.25 0 0118 18.75z" />
  </svg>
);

export const StudiesIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

export const DefaultIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const BellIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

export const CogIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.508-2.378A5.985 5.985 0 0118 9.75V7.5M6 9.75A5.985 5.985 0 017.508 7.122M12 4.5V3m0 18v-1.5m-3.032-2.032a5.983 5.983 0 01-2.434-1.536m7.5 1.536a5.983 5.983 0 00-2.434-1.536M12 12a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.086 3.325.254A48.076 48.076 0 0112 5.25c.973 0 1.942-.097 2.884-.281.012-.002.023-.005.035-.007.012-.002.024-.004.036-.006a48.108 48.108 0 00-3.478-.397m-12.56 0H4.5" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = (props) => ( // This is the XMarkIcon
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export const Bars3Icon: React.FC<IconProps> = (props) => ( // Hamburger Icon
  <svg {...defaultIconProps(props)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const PencilIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps(props)} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

export const XMarkIcon = CloseIcon; // Alias for clarity in usage


export const APPOINTMENT_TYPE_ICONS: Record<AppointmentType, React.FC<IconProps>> = {
  [AppointmentType.BIRTHDAY]: BirthdayIcon,
  [AppointmentType.DENTIST]: DentistIcon,
  [AppointmentType.DOCTOR]: DoctorIcon,
  [AppointmentType.NOTE_TASK]: NoteTaskIcon,
  [AppointmentType.TRAVEL]: TravelIcon,
  [AppointmentType.MANICURE]: ManicureIcon,
  [AppointmentType.HAIRDRESSER]: HairdresserIcon,
  [AppointmentType.SUPERMARKET]: SupermarketIcon,
  [AppointmentType.VISIT]: VisitIcon,
  [AppointmentType.MEDICINE]: MedicineIcon,
  [AppointmentType.EXERCISE]: ExerciseIcon,
  [AppointmentType.WORK_MEETING]: WorkMeetingIcon,
  [AppointmentType.STUDIES]: StudiesIcon,
  [AppointmentType.DEFAULT]: DefaultIcon,
};

export const APPOINTMENT_TYPE_NAMES: Record<AppointmentType, string> = {
  [AppointmentType.BIRTHDAY]: 'Aniversário',
  [AppointmentType.DENTIST]: 'Dentista',
  [AppointmentType.DOCTOR]: 'Médico/Consulta',
  [AppointmentType.NOTE_TASK]: 'Nota/Tarefa',
  [AppointmentType.TRAVEL]: 'Viagem',
  [AppointmentType.MANICURE]: 'Manicure',
  [AppointmentType.HAIRDRESSER]: 'Cabeleireiro',
  [AppointmentType.SUPERMARKET]: 'Supermercado',
  [AppointmentType.VISIT]: 'Visita',
  [AppointmentType.MEDICINE]: 'Remédio',
  [AppointmentType.EXERCISE]: 'Exercício Físico',
  [AppointmentType.WORK_MEETING]: 'Reunião de Trabalho',
  [AppointmentType.STUDIES]: 'Estudos',
  [AppointmentType.DEFAULT]: 'Padrão',
};

export const APPOINTMENT_TYPE_COLORS: Record<AppointmentType, string> = {
    [AppointmentType.BIRTHDAY]: 'bg-pink-500',
    [AppointmentType.DENTIST]: 'bg-cyan-500',
    [AppointmentType.DOCTOR]: 'bg-blue-500',
    [AppointmentType.NOTE_TASK]: 'bg-yellow-500',
    [AppointmentType.TRAVEL]: 'bg-orange-500',
    [AppointmentType.MANICURE]: 'bg-purple-500',
    [AppointmentType.HAIRDRESSER]: 'bg-fuchsia-500',
    [AppointmentType.SUPERMARKET]: 'bg-green-500',
    [AppointmentType.VISIT]: 'bg-teal-500',
    [AppointmentType.MEDICINE]: 'bg-red-500 text-white', // Special color defined in tailwind.config
    [AppointmentType.EXERCISE]: 'bg-lime-500',
    [AppointmentType.WORK_MEETING]: 'bg-indigo-500',
    [AppointmentType.STUDIES]: 'bg-sky-500',
    [AppointmentType.DEFAULT]: 'bg-gray-400',
};
