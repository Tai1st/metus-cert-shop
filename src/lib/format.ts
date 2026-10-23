// Hàm thuần dùng được cả ở server lẫn trình duyệt (không import gì chỉ chạy ở server).

export const vnd = (n: number) => n.toLocaleString('vi-VN') + 'đ';

export const fmtSize = (bytes = 0) => (bytes / 1048576).toFixed(1).replace('.', ',') + ' MB';
