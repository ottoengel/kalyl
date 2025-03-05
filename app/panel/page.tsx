"use client"
import Header from "../_components/header"
import AreaChart from "../_components/AreaChart"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../_components/ui/pagination"
import { Badge } from "../_components/ui/badge"
import { getUserTime } from "../_actions/get-user"
import { useEffect, useState } from "react"

const Panel = () => {
  const [totalUsers, setTotalUsers] = useState<number>(0) // Agora é um número

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUserTime()
      if (data.totalUsers > 0) {
        setTotalUsers(data.totalUsers)
      }
    }

    fetchData()
  }, [])
  return (
    <div>
      <Header />
      <div>
        <div className="mx-auto px-4 py-16 sm:max-w-xl md:max-w-full md:px-24 lg:max-w-screen-xl lg:px-8 lg:py-20">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 sm:h-12 sm:w-12">
                <svg
                  className="text-deep-purple-accent-400 h-8 w-8 sm:h-10 sm:w-10"
                  stroke="currentColor"
                  viewBox="0 0 52 52"
                >
                  <polygon
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    points="29 13 14 29 25 29 23 39 38 23 27 23"
                  ></polygon>
                </svg>
              </div>
              <h6 className="text-deep-purple-accent-400 text-4xl font-bold">
                {totalUsers}
              </h6>
              <p className="text-md mb-2 font-bold">Usuarios</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 sm:h-12 sm:w-12">
                <svg
                  className="text-deep-purple-accent-400 h-8 w-8 sm:h-10 sm:w-10"
                  stroke="currentColor"
                  viewBox="0 0 52 52"
                >
                  <polygon
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    points="29 13 14 29 25 29 23 39 38 23 27 23"
                  ></polygon>
                </svg>
              </div>
              <h6 className="text-deep-purple-accent-400 text-4xl font-bold">
                729
              </h6>
              <p className="text-md mb-2 font-bold">Usuarios Mensalistas</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 sm:h-12 sm:w-12">
                <svg
                  className="text-deep-purple-accent-400 h-8 w-8 sm:h-10 sm:w-10"
                  stroke="currentColor"
                  viewBox="0 0 52 52"
                >
                  <polygon
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    points="29 13 14 29 25 29 23 39 38 23 27 23"
                  ></polygon>
                </svg>
              </div>
              <h6 className="text-deep-purple-accent-400 text-4xl font-bold">
                1029
              </h6>
              <p className="text-md mb-2 font-bold">Cortes Feitos</p>
            </div>
          </div>
        </div>
        {/* Títulos Acima dos Gráficos */}
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Visão Geral da Barbearia
          </h3>
        </div>
        {/* Gráficos */}
        <div className="relative px-20 pb-20">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Gráfico 1 */}
            <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 md:p-6">
              <h3 className="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
                Diario
              </h3>
              <div className="flex justify-between">
                <div>
                  <h5 className="pb-2 text-3xl font-bold leading-none text-gray-900 dark:text-white">
                    32.4k
                  </h5>
                  <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Clientes Atendidos No Dia
                  </p>
                </div>
                <div className="flex items-center px-2.5 py-0.5 text-center text-base font-semibold text-green-500 dark:text-green-500">
                  12%
                  <svg
                    className="ms-1 h-3 w-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13V1m0 0L1 5m4-4 4 4"
                    />
                  </svg>
                </div>
              </div>
              {/* Gráfico */}
              <div id="area-chart">
                <AreaChart />
              </div>
            </div>

            {/* Gráfico 2 */}
            <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 md:p-6">
              <h3 className="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
                Tudo
              </h3>
              <div className="flex justify-between">
                <div>
                  <h5 className="pb-2 text-3xl font-bold leading-none text-gray-900 dark:text-white">
                    45.8k
                  </h5>
                  <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Faturamento Total
                  </p>
                </div>
                <div className="flex items-center px-2.5 py-0.5 text-center text-base font-semibold text-green-500 dark:text-green-500">
                  8%
                  <svg
                    className="ms-1 h-3 w-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13V1m0 0L1 5m4-4 4 4"
                    />
                  </svg>
                </div>
              </div>
              {/* Gráfico */}
              <div id="area-chart">
                <AreaChart />
              </div>
            </div>

            {/* Gráfico 3 */}
            <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 md:p-6">
              <h3 className="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
                Mensal
              </h3>
              <div className="flex justify-between">
                <div>
                  <h5 className="pb-2 text-3xl font-bold leading-none text-gray-900 dark:text-white">
                    21.3k
                  </h5>
                  <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                    Clientes Atendidos no Mês
                  </p>
                </div>
                <div className="flex items-center px-2.5 py-0.5 text-center text-base font-semibold text-red-500 dark:text-red-500">
                  -5%
                  <svg
                    className="ms-1 h-3 w-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 1v12m0 0 4-4m-4 4L1 9"
                    />
                  </svg>
                </div>
              </div>
              {/* Gráfico */}
              <div id="area-chart">
                <AreaChart />
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="container mx-auto overflow-x-hidden px-4">
        <div className="flex items-center gap-x-3">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">
            Mensalistas
          </h2>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600 dark:bg-gray-800 dark:text-blue-400">
            100 users
          </span>
        </div>

        <div className="mt-6 flex flex-col">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 dark:text-gray-400 rtl:text-right"
                      >
                        <div className="flex items-center gap-x-3">
                          <span>Name</span>
                        </div>
                      </th>

                      <th
                        scope="col"
                        className="px-12 py-3.5 text-left text-sm font-normal text-gray-500 dark:text-gray-400 rtl:text-right"
                      >
                        <button className="flex items-center gap-x-2">
                          <span>Status</span>
                        </button>
                      </th>

                      <th
                        scope="col"
                        className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 dark:text-gray-400 rtl:text-right"
                      >
                        <button className="flex items-center gap-x-2">
                          <span>Tipo</span>
                        </button>
                      </th>

                      <th
                        scope="col"
                        className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 dark:text-gray-400 rtl:text-right"
                      >
                        Email
                      </th>

                      <th
                        scope="col"
                        className="px-4 py-3.5 text-left text-sm font-normal text-gray-500 dark:text-gray-400 rtl:text-right"
                      ></th>

                      <th scope="col" className="relative px-4 py-3.5">
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                    <tr>
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-700">
                        <div className="inline-flex items-center gap-x-3">
                          <div className="flex items-center gap-x-2">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
                              alt=""
                            />
                            <div>
                              <h2 className="font-medium text-gray-800 dark:text-white">
                                Arthur Melo
                              </h2>{" "}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-12 py-4 text-sm font-medium text-gray-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-500">
                          Ativo
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                        Mensalista Cabelo e Barba
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                        authurmelo@example.com
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm"></td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        <div className="flex items-center gap-x-6">
                          <button className="text-gray-500 transition-colors duration-200 hover:text-red-500 focus:outline-none dark:text-gray-300 dark:hover:text-red-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke-width="1.5"
                              stroke="currentColor"
                              className="h-5 w-5"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </button>

                          <button className="text-gray-500 transition-colors duration-200 hover:text-yellow-500 focus:outline-none dark:text-gray-300 dark:hover:text-yellow-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke-width="1.5"
                              stroke="currentColor"
                              className="h-5 w-5"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>
    </div>
  )
}

export default Panel
