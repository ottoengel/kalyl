/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";
import Header from "../_components/header";
import { getUserTime, getUserInfo } from '../_actions/get-user';
import { useEffect, useState } from "react";
import { countBookings } from "../_actions/get-books"




const Panel = () => {
    const [totalUsers, setTotalUsers] = useState<number>(0); 
    const [totalBookings, setTotalBookings] = useState<number>(0); 
    const [users, setUsers] = useState<{ id: string, name: string | null; image: string | null; role: string; email: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getUserTime();
            if (data.totalUsers > 0) {
                setTotalUsers(data.totalUsers);
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            const tableUser = await getUserInfo();
            // Filtrando as roles que são "MENSALISTAC", "MENSALISTAB", ou "MENSALISTACB"
            const filteredUsers = tableUser.userInfo.filter(user =>
                ["MENSALISTAC", "MENSALISTAB", "MENSALISTACB"].includes(user.role)
            );
            setUsers(filteredUsers); // Atualiza o estado apenas com usuários filtrados
        };

        fetchData();
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            const total = await countBookings();
            if (total > 0) {
                setTotalBookings(total); // Define o valor corretamente
            }
        };
        fetchData();
    }, []);


    return (
        <div>
            <Header />
            <div>
                <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
                        <div className="text-center">
                            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-full bg-red-500 sm:w-12 sm:h-12">
                                <svg className="w-8 h-8 text-deep-purple-accent-400 sm:w-10 sm:h-10" stroke="currentColor" viewBox="0 0 52 52">
                                    <polygon strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" points="29 13 14 29 25 29 23 39 38 23 27 23"></polygon>
                                </svg>
                            </div>
                            <h6 className="text-4xl font-bold text-deep-purple-accent-400">{totalUsers}</h6>
                            <p className="mb-2 font-bold text-md">Usuarios</p>
                        </div>
                        {/* <div className="text-center">
                            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-full bg-red-500 sm:w-12 sm:h-12">
                                <svg className="w-8 h-8 text-deep-purple-accent-400 sm:w-10 sm:h-10" stroke="currentColor" viewBox="0 0 52 52">
                                    <polygon strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" points="29 13 14 29 25 29 23 39 38 23 27 23"></polygon>
                                </svg>
                            </div>
                            <h6 className="text-4xl font-bold text-deep-purple-accent-400">{totalMensalistas}</h6>
                            <p className="mb-2 font-bold text-md">Usuarios Mensalistas</p>
                        </div> */}
                        <div className="text-center">
                            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-full bg-red-500 sm:w-12 sm:h-12">
                                <svg className="w-8 h-8 text-deep-purple-accent-400 sm:w-10 sm:h-10" stroke="currentColor" viewBox="0 0 52 52">
                                    <polygon strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" points="29 13 14 29 25 29 23 39 38 23 27 23"></polygon>
                                </svg>
                            </div>
                            <h6 className="text-4xl font-bold text-deep-purple-accent-400">{totalBookings}</h6>
                            <p className="mb-2 font-bold text-md">Cortes Feitos</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Panel;
