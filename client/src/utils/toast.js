import { toast as reactToast, Bounce } from 'react-toastify';

const config = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
}

export const toast = {
    success: (message) => reactToast.success(message, config),
    error: (message) => reactToast.error(message, config),
    info: (message) => reactToast.info(message, config),
    warn: (message) => reactToast.warn(message, config),
    default: (message) => reactToast(message, config)
}

export const showTost = (message, type = "info") => {
    if (type === "success") {
        reactToast.success(message, config);
    }
    else if (type === "error") {
        reactToast.error(message, config);
    } else if (type === "info") {
        reactToast.info(message, config);
    }
    else if (type === "warn") {
        reactToast.warn(message, config);
    } else {
        reactToast(message, config);
    }
}