// @ts-nocheck
import {
    ACCOUNTS_CONTRACT,
    ACCOUNTS_PROXY_ADDRESS,
    ALFAJORES_CUSD_ADDRESS,
    FA_CONTRACT,
    FA_PROXY_ADDRESS,
    ODIS_PAYMENTS_CONTRACT,
    ODIS_PAYMENTS_PROXY_ADDRESS,
    STABLE_TOKEN_CONTRACT,
    ALFAJORES_RPC,
    Alfajores_cusd
} from "../utils/constants";

import { OdisUtils } from "@celo/identity";
import {
    AuthenticationMethod,
    OdisContextName,
} from "@celo/identity/lib/odis/query";
import { ethers, Wallet } from "ethers";
import React, { useState, useEffect, useReducer } from "react";
import { WebBlsBlindingClient } from "@/utils/WebBlindingClient";
const ISSUER_PRIVATE_KEY = '702e72b6f85b15f28e500b9aafca6bf1690463b411a54cbe4d5a47e8865549d3' // "0xd17d36016332c2e29650e5daa539fda5219a4dcb86b2854ee885bffc2310d4c9"
 const DEK_PUBLIC_KEY = '03663bbcaa737dbf538eb90cefc421513a93324334ecdbe72f5a053f6d50619e42' //"0x0254dc171ef5457582bcd6f477ec7dd60972a5bb64c5ecb95ce51fa0dd83aa07d1"

    
const DEK_PRIVATE_KEY = '1acbf2638007fc31f91abbd03c53dca7ee90f562610891d7626ebcb1c45d4ca2' //"0x6b687338da5cb9cd4be96f6a9bca7cc449eaf959c20071f066fb289f8eccf7e0"

const INITIAL_STATE = {
    issuer: undefined,
    serviceContext: undefined,
    authSigner: undefined,
    federatedAttestationsContract: undefined,
    odisPaymentsContract: undefined,
    accountsContract: undefined,
    stableTokenContract: undefined,
};

export const OdisContext = React.createContext(INITIAL_STATE);
let ONE_CENT_CUSD = ethers.utils.parseEther("0.01");

const reducer = (state = INITIAL_STATE, action:any) => {
    switch (action.type) {
        case "ISSUER":
            return { ...state, issuer: action.payload };
        case "FEDERATED_ATTESTATIONS":
            return { ...state, federatedAttestations: action.payload };
        case "ODIS_PAYMENTS":
            return { ...state, odisPayment: action.payload };
        case "STATE":
            return action.payload;
        default:
            return state;
    }
};

function OdisProvider({ children }) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

    useEffect(() => {
        const init = async () => {
            let provider = new ethers.providers.JsonRpcProvider(ALFAJORES_RPC);
            let issuer = new Wallet(ISSUER_PRIVATE_KEY, provider);
            let serviceContext = OdisUtils.Query.getServiceContext(
                OdisContextName.ALFAJORES
            );

            const blindingClient = new WebBlsBlindingClient(
                serviceContext.odisPubKey
            );
            await blindingClient.init();

            let authSigner = {
                authenticationMethod: AuthenticationMethod.ENCRYPTION_KEY,
                rawKey: DEK_PRIVATE_KEY,
            };

            let accountsContract = new ethers.Contract(
                ACCOUNTS_PROXY_ADDRESS,
                ACCOUNTS_CONTRACT.abi,
                issuer
            );
            let federatedAttestationsContract = new ethers.Contract(
                FA_PROXY_ADDRESS,
                FA_CONTRACT.abi,
                issuer
            );
            let odisPaymentsContract = new ethers.Contract(
                ODIS_PAYMENTS_PROXY_ADDRESS,
                ODIS_PAYMENTS_CONTRACT.abi,
                issuer
            );
            let stableTokenContract = new ethers.Contract(
                Alfajores_cusd,
                STABLE_TOKEN_CONTRACT.abi,
                issuer
            );

            dispatch({
                type: "STATE",
                payload: {
                    issuer,
                    serviceContext,
                    blindingClient,
                    authSigner,
                    accountsContract,
                    federatedAttestationsContract,
                    odisPaymentsContract,
                    stableTokenContract,
                },
            });
        };
        init();
    }, []);

    // async function getAccountsFromPhoneNumber(twitterHandle: string) {
    //     const identifier = await getIdentifier(twitterHandle);
    //     const attestations =
    //         await state.federatedAttestations.lookupAttestations(identifier, [
    //             state.issuer.address,
    //         ]);
    //     return attestations.accounts;
    // }

    // async function checkIfIdentifierIsRegisteredAlreadyUnderIssuer(
    //     phoneNumber
    // ) {
    //     const accounts = await getAccountsFromPhoneNumber(phoneNumber);
    //     return accounts.length;
    // }

    // async function deregisterIdentifier(phoneNumber, address) {
    //     const isRegistered =
    //         await checkIfIdentifierIsRegisteredAlreadyUnderIssuer(phoneNumber);
    //     if (isRegistered) {
    //         const identifier = await getIdentifier(phoneNumber);
    //         const revokeReceipt = await state.federatedAttestations
    //             .revokeAttestation(identifier, state.issuer.address, address)
    //             .sendAndWaitForReceipt();
    //         console.log(
    //             `${await explorerLink()}tx/${revokeReceipt.transactionHash}`
    //         );
    //     }
    // }

    // async function sendToPhoneNumber(from, to, value) {
    //     // Right now sending to the latest attested address
    //     const tx = await connector.sendTransaction({
    //         from,
    //         to,
    //         value,
    //     });
    //     console.log(tx);
    // }

    return (
        <OdisContext.Provider
            value={{
                issuer: state.issuer,
                serviceContext: state.serviceContext,
                authSigner: state.authSigner,
                odisPaymentsContract: state.odisPaymentsContract,
                stableTokenContract: state.stableTokenContract,
                federatedAttestationsContract:
                    state.federatedAttestationsContract,
            }}
        >
            {children}
        </OdisContext.Provider>
    );
}
export default OdisProvider;
