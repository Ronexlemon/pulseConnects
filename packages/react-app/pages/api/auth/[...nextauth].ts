// @ts-nocheck
import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import Reddit from "next-auth/providers/reddit";

export default NextAuth({
    providers: [
        TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID as string,
            clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
            version: "2.0",
        }),
        Discord({
            clientId: process.env.TWITTER_CLIENT_ID as string,
            clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
            version: "2.0",
        }),
        Google({
            clientId: process.env.TWITTER_CLIENT_ID as string,
            clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
            version: "2.0",
        }),
        Reddit({
            clientId: process.env.TWITTER_CLIENT_ID as string,
            clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
            version: "2.0",
        }),
    ],
    callbacks: {
        async jwt({ token, profile, account }) {
            if (profile) {
                token.username = profile.data.username;
            }
            return token;
        },
        async session({ session, token, user }) {
            console.log("Session", token);
            if (token.username) {
                session.username = token.username;
            }
            return session;
        },
    },
    debug: true,
    logger: {
        error(code, metadata) {
            console.error(code, metadata);
        },
    },
});
