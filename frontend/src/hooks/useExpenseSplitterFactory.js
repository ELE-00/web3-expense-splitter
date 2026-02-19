//useExpenseSplitterFactory.js
import { useState, useMemo, useCallback } from "react";
import { ethers } from "ethers";
import ExpenseSplitterFactoryABI from "../constants/ExpenseSplitterFactoryABI.json";
import ExpenseSplitterABI from "../constants/ExpenseSplitterABI.json";
import { useWallet } from "../context/WalletContext";
import { EXPENSE_SPLITTER_FACTORY_ADDRESS } from "../constants/contracts";


export const useExpenseSplitterFactory = () => {

    const { signer, account } = useWallet();

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);



    const contract = useMemo(() => {
        if (!signer) return null;
        return new ethers.Contract(
        EXPENSE_SPLITTER_FACTORY_ADDRESS,
        ExpenseSplitterFactoryABI,
        signer
        );
    }, [signer]);


    // Get groups where current account is a member
    const getGroups = useCallback(async () => {
        if (!contract || !account) return;

        setLoading(true);
        setError(null);

        try {
            const groupData = await contract.getGroups();

            const membershipChecks = await Promise.all(
                groupData.map(async (group) => {
                    try {
                        const groupContract = new ethers.Contract(group.contractAddress, ExpenseSplitterABI, signer);
                        const isMember = await groupContract.isMember(account);
                        return isMember ? group : null;
                    } catch {
                        return null;
                    }
                })
            );

            setGroups(membershipChecks.filter(Boolean));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [contract, account, signer]);



    // Create contract - returns new group address
    const createGroup = useCallback(async (name) => {
        setSubmitting(true);
        setError(null);

        try {
            const tx = await contract.createGroup(name);
            const receipt = await tx.wait();

            // Parse ContractCreated event to get new group address
            const event = receipt.logs
                .map(log => {
                    try {
                        return contract.interface.parseLog(log);
                    } catch {
                        return null;
                    }
                })
                .find(parsed => parsed?.name === "ContractCreated");

            const newGroupAddress = event?.args?._address;

            await getGroups();
            return newGroupAddress;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setSubmitting(false);
        }
    }, [contract, getGroups]);



    return {
        groups,
        loading,
        submitting,
        error,
        getGroups,
        createGroup
    }
}