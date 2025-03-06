import { useEffect, useState } from "react";
import { getUserInfo } from "../_actions/get-user";
import { User } from "lucide-react";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Modaledit = ({ isOpen, onClose }: ModalProps) => {
    const [users, setUsers] = useState<{
        id: string;
        name: string | null;
        image: string | null;
        role: string;
    }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const tableUser = await getUserInfo();
            const filteredUsers = tableUser.userInfo.filter(user =>
                ["MENSALISTAC", "MENSALISTAB", "MENSALISTACB"].includes(user.role)
            );
            setUsers(filteredUsers);
        };

        if (isOpen) fetchData();
    }, [isOpen]); // Só busca os dados quando o modal abrir

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            {/* Backdrop clicável para fechar o modal */}
            <div
                className="fixed inset-0 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            <div className="relative z-10 m-4 p-6 w-2/5 rounded-lg dark:bg-gray-800 bg-white shadow-lg">
                <div className="flex justify-between items-center pb-4 text-xl font-medium text-gray-900 dark:text-white">
                    <h2>Editar Usuário</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                        ✖
                    </button>
                </div>

                {/* Tabela de usuários */}
                <div className="h-[200px] overflow-auto border-t border-gray-200 dark:border-gray-600 py-4">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-white">Nome</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-white">Role</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                        <td className="px-4 py-2 flex items-center gap-3 text-gray-800 dark:text-white">
                                            {user.image ? (
                                                <Image
                                                    className="rounded-full object-cover"
                                                    src={user.image}
                                                    alt={user.name || "No name"}
                                                    width={40} // Defina um tamanho apropriado
                                                    height={40}
                                                />
                                            ) : (
                                                <User className="w-10 h-10 text-gray-500" /> // Ícone de fallback
                                            )}
                                            {user.name || "Usuário sem nome"}
                                        </td>
                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                                            <Select>
                                                <SelectTrigger className="w-[210px]">
                                                    <SelectValue placeholder="Selecione o serviço" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="barba">{user.role}</SelectItem>
                                                </SelectContent>
                                            </Select></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-gray-300 py-2 px-4 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onClose}
                        className="rounded-md bg-green-600 py-2 px-4 text-white hover:bg-green-700 ml-2"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modaledit;
