import React from "react";

import UsersList from '../components/UsersList'

const Users = () => {
    const USERS = [
        {
            id: 'u1',
            name: 'Ryan Chalmers',
            image: 'https://picsum.photos/id/237/200/300',
            places: 3
        }
    ];
    return <UsersList items={USERS}/>;
};

export default Users;