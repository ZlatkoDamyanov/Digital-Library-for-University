import React from 'react';
import Header from '../../components/layout/Header';
import { useUser } from '../../contexts/UserContext';


const MyProfile = () => {
    const { user } = useUser();

    return (
        <>
            <Header 
                firstName={user?.firstName || ''} 
                lastName={user?.lastName || ''} 
                userAvatarUrl={user?.avatarUrl || null}
            />
        </>
    );
};

export default MyProfile;