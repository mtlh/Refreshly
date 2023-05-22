import { createSignal } from "solid-js";
import server$ from "solid-start/server";
import { auth } from "~/db/schema";
import { db } from "~/functions/db_client";
import { eq } from "drizzle-orm";
import Cookies from "js-cookie";
import { encryptCheck } from "~/functions/encrypt";
import { generatetoken } from "~/functions/generatetoken";
import { SignJWT } from 'jose';

const Signup = () => {
    const [username, setUsername] = createSignal("");
    const [pass, setPass] = createSignal("");
    const [errorOutput, setErrorOutput] = createSignal("");

    async function useLogin () {
        const logincheck = server$(async (pass, username) => {
            if (pass && username) { 
                const findusername = await db.select().from(auth).where(eq(auth.username, username))
                if (findusername.length == 1) {
                    // @ts-ignore
                    const issame = await encryptCheck(pass, findusername[0].pass);
                    if (issame == true) {
                        // @ts-ignore
                        const key = new TextEncoder().encode(process.env.JWTSECRET);
                        // @ts-ignore
                        var token = await new SignJWT({ token: generatetoken(100) }).setProtectedHeader({ alg: 'HS256' }).sign(key);
                        const updatetoken = await db.update(auth).set({token: token}).where(eq(auth.username, username)); 
                        return {error: "/dashboard", token: token};
                    } else {
                        return {error: "Invalid username or password", token: null};
                    }
                } else {
                    return {error: "Username not found", token: null};
                }
            } else {
                return {error: "All fields must be completed", token: null};
            }
        })
        var error = await logincheck(pass(), username());
        if (error.token != null) {Cookies.set("auth", error.token); location.href = "/dashboard";} else {setErrorOutput(error.error)};
    }
    return (
        <>
            <section>
                <div class="flex flex-col items-center justify-center px-6 mx-auto h-screen lg:py-0">
                    {/* <a href="#" class="flex items-center text-left mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
                        <svg class="cursor-pointer w-12 h-12 mr-2" viewBox="0 0 34 34" fill="light blue" xmlns="http://www.w3.org/2000/svg"><path fill="light blue" d="M1 17H0H1ZM7 17H6H7ZM17 27V28V27ZM27 17H28H27ZM17 0C12.4913 0 8.1673 1.79107 4.97918 4.97918L6.3934 6.3934C9.20644 3.58035 13.0218 2 17 2V0ZM4.97918 4.97918C1.79107 8.1673 0 12.4913 0 17H2C2 13.0218 3.58035 9.20644 6.3934 6.3934L4.97918 4.97918ZM0 17C0 21.5087 1.79107 25.8327 4.97918 29.0208L6.3934 27.6066C3.58035 24.7936 2 20.9782 2 17H0ZM4.97918 29.0208C8.1673 32.2089 12.4913 34 17 34V32C13.0218 32 9.20644 30.4196 6.3934 27.6066L4.97918 29.0208ZM17 34C21.5087 34 25.8327 32.2089 29.0208 29.0208L27.6066 27.6066C24.7936 30.4196 20.9782 32 17 32V34ZM29.0208 29.0208C32.2089 25.8327 34 21.5087 34 17H32C32 20.9782 30.4196 24.7936 27.6066 27.6066L29.0208 29.0208ZM34 17C34 12.4913 32.2089 8.1673 29.0208 4.97918L27.6066 6.3934C30.4196 9.20644 32 13.0218 32 17H34ZM29.0208 4.97918C25.8327 1.79107 21.5087 0 17 0V2C20.9782 2 24.7936 3.58035 27.6066 6.3934L29.0208 4.97918ZM17 6C14.0826 6 11.2847 7.15893 9.22183 9.22183L10.636 10.636C12.3239 8.94821 14.6131 8 17 8V6ZM9.22183 9.22183C7.15893 11.2847 6 14.0826 6 17H8C8 14.6131 8.94821 12.3239 10.636 10.636L9.22183 9.22183ZM6 17C6 19.9174 7.15893 22.7153 9.22183 24.7782L10.636 23.364C8.94821 21.6761 8 19.3869 8 17H6ZM9.22183 24.7782C11.2847 26.8411 14.0826 28 17 28V26C14.6131 26 12.3239 25.0518 10.636 23.364L9.22183 24.7782ZM17 28C19.9174 28 22.7153 26.8411 24.7782 24.7782L23.364 23.364C21.6761 25.0518 19.3869 26 17 26V28ZM24.7782 24.7782C26.8411 22.7153 28 19.9174 28 17H26C26 19.3869 25.0518 21.6761 23.364 23.364L24.7782 24.7782ZM28 17C28 14.0826 26.8411 11.2847 24.7782 9.22183L23.364 10.636C25.0518 12.3239 26 14.6131 26 17H28ZM24.7782 9.22183C22.7153 7.15893 19.9174 6 17 6V8C19.3869 8 21.6761 8.94821 23.364 10.636L24.7782 9.22183ZM10.3753 8.21913C6.86634 11.0263 4.86605 14.4281 4.50411 18.4095C4.14549 22.3543 5.40799 26.7295 8.13176 31.4961L9.86824 30.5039C7.25868 25.9371 6.18785 21.9791 6.49589 18.5905C6.80061 15.2386 8.46699 12.307 11.6247 9.78087L10.3753 8.21913ZM23.6247 25.7809C27.1294 22.9771 29.1332 19.6127 29.4958 15.6632C29.8549 11.7516 28.5904 7.41119 25.8682 2.64741L24.1318 3.63969C26.7429 8.20923 27.8117 12.1304 27.5042 15.4803C27.2001 18.7924 25.5372 21.6896 22.3753 24.2191L23.6247 25.7809Z" /></svg>
                        Refreshly   
                    </a> */}
                    <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md md:max-w-3xl lg:max-w-3xl xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Login to your account
                            </h1>
                            <div class="space-y-4 md:space-y-6">
                                <div>
                                    <label for="username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
                                    <input class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={username()} oninput={(e)=>{setUsername(e.currentTarget.value)}} placeholder="User" type="username" name="username" id="username" />
                                </div>
                                <div>
                                    <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                    <input value={pass()} oninput={(e)=>{setPass(e.currentTarget.value);}} type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                                </div>
                                <button type="submit" 
                                    onclick={useLogin}
                                    class="w-full text-white bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                    >Login</button>
                                <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                                    Dont have an account? <a href="/login" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Create one</a>
                                </p>
                                <p class="text-red-600 text-lg p-2">{errorOutput()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Signup;