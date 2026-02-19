export function parseError(error) {
    const msg = typeof error === "string" ? error : error?.message || "Unknown error";

    if (msg.includes("user rejected") || msg.includes("ACTION_REJECTED")) {
        return "Transaction rejected by user";
    }
    if (msg.includes("insufficient funds")) {
        return "Insufficient funds for this transaction";
    }
    if (msg.includes("CALL_EXCEPTION") || msg.includes("execution reverted")) {
        const revertMatch = msg.match(/reason="([^"]+)"/);
        if (revertMatch) return revertMatch[1];
        return "Transaction failed on-chain";
    }
    if (msg.includes("NETWORK_ERROR") || msg.includes("network changed")) {
        return "Network error — check your connection";
    }
    if (msg.includes("TIMEOUT")) {
        return "Request timed out — try again";
    }

    // Truncate overly long ethers messages
    if (msg.length > 120) {
        return msg.slice(0, 120) + "...";
    }
    return msg;
}
