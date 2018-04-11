// import * as React from 'react';
// import { Card, Icon } from 'antd';

// import Faculty from '../models/Faculty';
// import CardInfo from './CardInfo';

// export interface SelectAdminProps {
//   faculties: Faculty[];
//   adminFaculty: Faculty | undefined;
//   onAdminSelected: (faculty: Faculty) => void;
// }

// export default class SelectAdmin extends React.Component<SelectAdminProps, any> {
//   render() {
//     const faculties = this.props.faculties.filter(f => f.isAdmin);
//     const { adminFaculty } = this.props;

//     return (
//       <div>
//         <p>Please select the faculty of your senior design 2.</p>
//         <div className="admin-container">
//           {faculties.map(f => (
//             <CardInfo
//               key={f._id}
//               onClick={(e) => this.props.onAdminSelected(f)}
//               isSelected={adminFaculty && adminFaculty._id === f._id}
//               title={`Dr. ${f.firstName} ${f.lastName}`}
//               description="CS faculty"
//             />
//           ))}
//         </div>
//         <style jsx>{`
//           .admin-container {
//             display: flex;
//             flex-wrap: wrap;
//             // Add a gap when admin faculties display in multiple lines
//             margin-top: -16px;
//           }
//         `}</style>
//       </div>
//     );
//   }
// }
