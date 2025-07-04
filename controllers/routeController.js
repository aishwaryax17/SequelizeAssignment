
exports.generateAccessToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const newAccessToken = jwt.sign({ id: payload.id }, ACCESS_SECRET, { expiresIn: '15m' });
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        return res.sendStatus(403); // Invalid refresh token
    }
}