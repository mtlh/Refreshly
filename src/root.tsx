// @refresh reload
import { Suspense } from "solid-js";
import { useLocation, Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title, useNavigate } from "solid-start";
import "./root.css";
import { login, logout, useSession } from "./components/LoginHooks";
import { addusertodb } from "./functions/adduser";
import ToggleTeam from "./components/Toggle/ToggleTeam";
import ToggleProject from "./components/Toggle/ToggleProject";

export default function Root() {
  const location = useLocation().pathname;
  const session = useSession();
  const user = () => session()?.user;
  if (user()) {
    addusertodb(user()?.name, user()?.email, user()?.image);
  }
  return (
    <Html lang="en" data-theme="winter">
      <Head>
        <Title>Refreshly</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.5/flowbite.min.js" />
            <main>
              <div class="lg:hidden top-0 w-full fixed bg-sky-900">
                <button data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar" type="button" class="fixed items-center p-2 mt-2 ml-3 text-sm text-white rounded-lg lg:hidden focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                  <span class="sr-only">Open sidebar</span>
                  <svg class="w-8 h-8" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                  </svg>
                </button>
                <div class="flex p-2 text-black rounded-2xl dark:text-white dark:hover:bg-gray-700 place-items-center justify-center">
                  <a href="/" class="flex m-auto place-items-center justify-center">
                      <svg class="cursor-pointer w-12 h-12" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M1 17H0H1ZM7 17H6H7ZM17 27V28V27ZM27 17H28H27ZM17 0C12.4913 0 8.1673 1.79107 4.97918 4.97918L6.3934 6.3934C9.20644 3.58035 13.0218 2 17 2V0ZM4.97918 4.97918C1.79107 8.1673 0 12.4913 0 17H2C2 13.0218 3.58035 9.20644 6.3934 6.3934L4.97918 4.97918ZM0 17C0 21.5087 1.79107 25.8327 4.97918 29.0208L6.3934 27.6066C3.58035 24.7936 2 20.9782 2 17H0ZM4.97918 29.0208C8.1673 32.2089 12.4913 34 17 34V32C13.0218 32 9.20644 30.4196 6.3934 27.6066L4.97918 29.0208ZM17 34C21.5087 34 25.8327 32.2089 29.0208 29.0208L27.6066 27.6066C24.7936 30.4196 20.9782 32 17 32V34ZM29.0208 29.0208C32.2089 25.8327 34 21.5087 34 17H32C32 20.9782 30.4196 24.7936 27.6066 27.6066L29.0208 29.0208ZM34 17C34 12.4913 32.2089 8.1673 29.0208 4.97918L27.6066 6.3934C30.4196 9.20644 32 13.0218 32 17H34ZM29.0208 4.97918C25.8327 1.79107 21.5087 0 17 0V2C20.9782 2 24.7936 3.58035 27.6066 6.3934L29.0208 4.97918ZM17 6C14.0826 6 11.2847 7.15893 9.22183 9.22183L10.636 10.636C12.3239 8.94821 14.6131 8 17 8V6ZM9.22183 9.22183C7.15893 11.2847 6 14.0826 6 17H8C8 14.6131 8.94821 12.3239 10.636 10.636L9.22183 9.22183ZM6 17C6 19.9174 7.15893 22.7153 9.22183 24.7782L10.636 23.364C8.94821 21.6761 8 19.3869 8 17H6ZM9.22183 24.7782C11.2847 26.8411 14.0826 28 17 28V26C14.6131 26 12.3239 25.0518 10.636 23.364L9.22183 24.7782ZM17 28C19.9174 28 22.7153 26.8411 24.7782 24.7782L23.364 23.364C21.6761 25.0518 19.3869 26 17 26V28ZM24.7782 24.7782C26.8411 22.7153 28 19.9174 28 17H26C26 19.3869 25.0518 21.6761 23.364 23.364L24.7782 24.7782ZM28 17C28 14.0826 26.8411 11.2847 24.7782 9.22183L23.364 10.636C25.0518 12.3239 26 14.6131 26 17H28ZM24.7782 9.22183C22.7153 7.15893 19.9174 6 17 6V8C19.3869 8 21.6761 8.94821 23.364 10.636L24.7782 9.22183ZM10.3753 8.21913C6.86634 11.0263 4.86605 14.4281 4.50411 18.4095C4.14549 22.3543 5.40799 26.7295 8.13176 31.4961L9.86824 30.5039C7.25868 25.9371 6.18785 21.9791 6.49589 18.5905C6.80061 15.2386 8.46699 12.307 11.6247 9.78087L10.3753 8.21913ZM23.6247 25.7809C27.1294 22.9771 29.1332 19.6127 29.4958 15.6632C29.8549 11.7516 28.5904 7.41119 25.8682 2.64741L24.1318 3.63969C26.7429 8.20923 27.8117 12.1304 27.5042 15.4803C27.2001 18.7924 25.5372 21.6896 22.3753 24.2191L23.6247 25.7809Z" /></svg>
                      <span class="ml-3 text-2xl text-white italic">Refreshly</span>
                  </a>
                </div>
              </div>

              <aside id="default-sidebar" class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full lg:translate-x-0" aria-label="Sidebar">
                <div class="h-full px-3 py-4 overflow-y-auto bg-sky-900 dark:bg-gray-800">
                    <ul class="space-y-2 font-medium">
                      <li>
                        <a class="flex items-center p-2 text-black rounded-2xl dark:text-white dark:hover:bg-gray-700 mb-4" href="/">
                            <svg class="cursor-pointer w-12 h-12" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M1 17H0H1ZM7 17H6H7ZM17 27V28V27ZM27 17H28H27ZM17 0C12.4913 0 8.1673 1.79107 4.97918 4.97918L6.3934 6.3934C9.20644 3.58035 13.0218 2 17 2V0ZM4.97918 4.97918C1.79107 8.1673 0 12.4913 0 17H2C2 13.0218 3.58035 9.20644 6.3934 6.3934L4.97918 4.97918ZM0 17C0 21.5087 1.79107 25.8327 4.97918 29.0208L6.3934 27.6066C3.58035 24.7936 2 20.9782 2 17H0ZM4.97918 29.0208C8.1673 32.2089 12.4913 34 17 34V32C13.0218 32 9.20644 30.4196 6.3934 27.6066L4.97918 29.0208ZM17 34C21.5087 34 25.8327 32.2089 29.0208 29.0208L27.6066 27.6066C24.7936 30.4196 20.9782 32 17 32V34ZM29.0208 29.0208C32.2089 25.8327 34 21.5087 34 17H32C32 20.9782 30.4196 24.7936 27.6066 27.6066L29.0208 29.0208ZM34 17C34 12.4913 32.2089 8.1673 29.0208 4.97918L27.6066 6.3934C30.4196 9.20644 32 13.0218 32 17H34ZM29.0208 4.97918C25.8327 1.79107 21.5087 0 17 0V2C20.9782 2 24.7936 3.58035 27.6066 6.3934L29.0208 4.97918ZM17 6C14.0826 6 11.2847 7.15893 9.22183 9.22183L10.636 10.636C12.3239 8.94821 14.6131 8 17 8V6ZM9.22183 9.22183C7.15893 11.2847 6 14.0826 6 17H8C8 14.6131 8.94821 12.3239 10.636 10.636L9.22183 9.22183ZM6 17C6 19.9174 7.15893 22.7153 9.22183 24.7782L10.636 23.364C8.94821 21.6761 8 19.3869 8 17H6ZM9.22183 24.7782C11.2847 26.8411 14.0826 28 17 28V26C14.6131 26 12.3239 25.0518 10.636 23.364L9.22183 24.7782ZM17 28C19.9174 28 22.7153 26.8411 24.7782 24.7782L23.364 23.364C21.6761 25.0518 19.3869 26 17 26V28ZM24.7782 24.7782C26.8411 22.7153 28 19.9174 28 17H26C26 19.3869 25.0518 21.6761 23.364 23.364L24.7782 24.7782ZM28 17C28 14.0826 26.8411 11.2847 24.7782 9.22183L23.364 10.636C25.0518 12.3239 26 14.6131 26 17H28ZM24.7782 9.22183C22.7153 7.15893 19.9174 6 17 6V8C19.3869 8 21.6761 8.94821 23.364 10.636L24.7782 9.22183ZM10.3753 8.21913C6.86634 11.0263 4.86605 14.4281 4.50411 18.4095C4.14549 22.3543 5.40799 26.7295 8.13176 31.4961L9.86824 30.5039C7.25868 25.9371 6.18785 21.9791 6.49589 18.5905C6.80061 15.2386 8.46699 12.307 11.6247 9.78087L10.3753 8.21913ZM23.6247 25.7809C27.1294 22.9771 29.1332 19.6127 29.4958 15.6632C29.8549 11.7516 28.5904 7.41119 25.8682 2.64741L24.1318 3.63969C26.7429 8.20923 27.8117 12.1304 27.5042 15.4803C27.2001 18.7924 25.5372 21.6896 22.3753 24.2191L23.6247 25.7809Z" /></svg>
                            <span class="ml-3 text-2xl text-white italic">Refreshly</span>
                        </a>
                      </li>
                      {user() &&
                        <>
                          <li>
                            {location == "/dashboard" ?
                              <p class="flex items-center p-2 text-black rounded-2xl bg-white dark:text-white dark:hover:bg-gray-700">
                                <svg aria-hidden="true" class="w-6 h-6 text-black transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
                                <span class="ml-3">Dashboard</span>
                              </p>
                              :
                              <a href="/dashboard" class="flex items-center p-2 text-white rounded-lg dark:text-white dark:hover:bg-gray-700">
                                <svg aria-hidden="true" class="w-6 h-6 text-white transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
                                <span class="ml-3">Dashboard</span>
                              </a>
                            }
                          </li>
                          <li>
                            {location == "/planner" ?
                                <p class="flex items-center p-2 text-black rounded-2xl bg-white dark:text-white dark:hover:bg-gray-700">
                                  <svg aria-hidden="true" class="flex-shrink-0 w-6 h-6 text-black transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                  <span class="flex-1 ml-3 whitespace-nowrap">Planner</span>
                                  <span class="inline-flex items-center justify-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300">3</span>
                                </p>
                                :
                                <a href="/planner" class="flex items-center p-2 text-white rounded-lg dark:text-white dark:hover:bg-gray-700">
                                  <svg aria-hidden="true" class="flex-shrink-0 w-6 h-6 text-white transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                  <span class="flex-1 ml-3 whitespace-nowrap">Planner</span>
                                  <span class="inline-flex items-center justify-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300">3</span>
                                </a>
                              }
                          </li>
                          <li>
                              {location == "/inbox" ?
                                <p class="flex items-center p-2 text-black rounded-2xl bg-white dark:text-white dark:hover:bg-gray-700">
                                  <svg aria-hidden="true" class="flex-shrink-0 w-6 h-6 text-black transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z"></path><path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"></path></svg>
                                  <span class="flex-1 ml-3 whitespace-nowrap">Inbox</span>
                                  <span class="inline-flex items-center justify-center w-3 h-3 p-3 ml-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">3</span>
                                </p>
                                :
                                <a href="/inbox" class="flex items-center p-2 text-white rounded-lg dark:text-white dark:hover:bg-gray-700">
                                  <svg aria-hidden="true" class="flex-shrink-0 w-6 h-6 text-white transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z"></path><path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"></path></svg>
                                  <span class="flex-1 ml-3 whitespace-nowrap">Inbox</span>
                                  <span class="inline-flex items-center justify-center w-3 h-3 p-3 ml-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">3</span>
                                </a>
                              }
                          </li>
                          <ToggleTeam />
                          <ToggleProject />
                          <li>
                              {location == "/profile" ?
                                <p class="flex items-center p-2 text-black rounded-2xl bg-white dark:text-white dark:hover:bg-gray-700">
                                  <img class="flex-shrink-0 w-6 h-6 text-white transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white rounded-xl"
                                    src={user()?.image?.toString()} />
                                  <span class="flex-1 ml-3 whitespace-nowrap">{user()?.name}</span>
                                </p>
                                :
                                <a href="/profile" class="flex items-center p-2 text-white rounded-lg dark:text-white dark:hover:bg-gray-700 cursor-pointer">
                                  <img class="flex-shrink-0 w-6 h-6 text-white transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white rounded-xl"
                                    src={user()?.image?.toString()} />
                                  <span class="flex-1 ml-3 whitespace-nowrap">{user()?.name}</span>
                                </a>
                              }
                          </li>
                          <li>
                              {location == "/settings" ?
                                <p class="flex items-center p-2 text-black rounded-2xl bg-white dark:text-white dark:hover:bg-gray-700">
                                  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="flex-shrink-0 w-6 h-6 text-black transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"  stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M56 32a23.74 23.74 0 0 0-.32-3.89L48 25.37 51.5 18a24.41 24.41 0 0 0-5.5-5.5L38.63 16l-2.74-7.68a23.8 23.8 0 0 0-7.78 0L25.37 16 18 12.5a24.41 24.41 0 0 0-5.5 5.5l3.5 7.37-7.68 2.74a23.8 23.8 0 0 0 0 7.78L16 38.63 12.5 46a24.41 24.41 0 0 0 5.5 5.5l7.37-3.5 2.74 7.68a23.8 23.8 0 0 0 7.78 0L38.63 48 46 51.5a24.41 24.41 0 0 0 5.5-5.5L48 38.63l7.68-2.74A23.74 23.74 0 0 0 56 32z"></path><circle cx="32" cy="32" r="4"></circle></g></svg>
                                  <span class="flex-1 ml-3 whitespace-nowrap">Settings</span>
                                </p>
                                :
                                <a href="/settings" class="flex items-center p-2 text-white rounded-lg dark:text-white dark:hover:bg-gray-700">
                                  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="flex-shrink-0 w-6 h-6 text-white transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"  stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M56 32a23.74 23.74 0 0 0-.32-3.89L48 25.37 51.5 18a24.41 24.41 0 0 0-5.5-5.5L38.63 16l-2.74-7.68a23.8 23.8 0 0 0-7.78 0L25.37 16 18 12.5a24.41 24.41 0 0 0-5.5 5.5l3.5 7.37-7.68 2.74a23.8 23.8 0 0 0 0 7.78L16 38.63 12.5 46a24.41 24.41 0 0 0 5.5 5.5l7.37-3.5 2.74 7.68a23.8 23.8 0 0 0 7.78 0L38.63 48 46 51.5a24.41 24.41 0 0 0 5.5-5.5L48 38.63l7.68-2.74A23.74 23.74 0 0 0 56 32z"></path><circle cx="32" cy="32" r="4"></circle></g></svg>
                                  <span class="flex-1 ml-3 whitespace-nowrap">Settings</span>
                                </a>
                              }
                          </li>
                          <li>
                              <a class="flex items-center p-2 text-white rounded-lg dark:text-white dark:hover:bg-gray-700 cursor-pointer" onclick={() => logout()}>
                                <svg aria-hidden="true" class="flex-shrink-0 w-6 h-6 text-white transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"></path></svg>
                                <span class="flex-1 ml-3 whitespace-nowrap">Sign Out</span>
                              </a>
                          </li>
                        </>
                      }
                      {!user() &&
                        <>
                          <li>
                              <a class="flex items-center p-2 text-white rounded-lg dark:text-white dark:hover:bg-gray-700 cursor-pointer" onclick={() => login()}>
                                <svg aria-hidden="true" class="flex-shrink-0 w-6 h-6 text-white transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"></path></svg>
                                <span class="flex-1 ml-3 whitespace-nowrap">Sign In</span>
                              </a>
                          </li>
                          {/* 
                          <li>
                              <a href="/signup" class="flex items-center p-2 text-white rounded-lg dark:text-white dark:hover:bg-gray-700">
                                <svg aria-hidden="true" class="flex-shrink-0 w-6 h-6 text-white transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clip-rule="evenodd"></path></svg>
                                <span class="flex-1 ml-3 whitespace-nowrap">Sign Up</span>
                              </a>
                          </li>
                           */ }
                        </>
                      }
                    </ul>
                </div>
              </aside>

              <div class="p-4 lg:ml-64">
                <div class="p-4 mt-10 lg:mt-0">
                  <Routes>
                    <FileRoutes />
                  </Routes>
                </div>
              </div>
            </main>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
