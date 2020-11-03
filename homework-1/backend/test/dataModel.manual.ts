

import log4js from "log4js";
import db from "../src/db";
import { FriendMapper, FriendStatus } from "../src/model/friend";
import { UserProfile, UserProfileMapper } from "../src/model/profile";

log4js.configure({
    appenders: { console: { type: "console" } },
    categories: { default: { appenders: ["console"], level: "debug" } }
});

db.init({});

let newProfileId: number;

const getProfile = async () => {
    const res: UserProfile = await UserProfileMapper.query(1);
    Object.keys(res).forEach((i: keyof UserProfile) => console.log(i, res[i], typeof res[i], res[i] && res[i].constructor));
};

const saveProfile = async () => {
    const profile = new UserProfile({ email: `new@example${(Math.random() * 100).toFixed()}.com` });
    profile.birthday = new Date(1986, 5, 31);
    profile.gender = "female";
    profile.interests = ["running", "boxing", "drinking"];
    newProfileId = await UserProfileMapper.create(profile);
};

const updateProfile = async () => {
    const profile = new UserProfile({ id: newProfileId });
    profile.gender = "male";
    await UserProfileMapper.save(profile);
};

const queryFriendsAndRequests = async () => {
    const friends = await FriendMapper.query({ userId: 5, status: FriendStatus.SENT_REQUEST | FriendStatus.FRIEND });
    console.log("Friend requests and friends:");
    friends.forEach(friend => {
        console.log(friend.id, friend.firstName, friend.lastName, friend.status);
    });
};

const queryFriends = async () => {
    const friends = await FriendMapper.query({ userId: 5, status: FriendStatus.FRIEND });
    console.log("Friends:");
    friends.forEach(friend => {
        console.log(friend.id, friend.firstName, friend.lastName, friend.status);
    });
};

const queryRequests = async () => {
    const friends = await FriendMapper.query({ userId: 5, status: FriendStatus.SENT_REQUEST });
    console.log("Friend requests:");
    friends.forEach(friend => {
        console.log(friend.id, friend.firstName, friend.lastName, friend.status);
    });
};

const requestFriend = async () => {
    await FriendMapper.sendFriendRequest(3, 5);
};

const acceptFriend = async () => {
    await FriendMapper.acceptFriend(5, 3);
};

const queryFriendsAndRequestsLimitOffset = async () => {
    const friends = await FriendMapper.query(
        {
            userId: 5,
            status: FriendStatus.SENT_REQUEST | FriendStatus.FRIEND,
            paginated: [1, 3]
        });
    console.log("Paginated friend requests and friends:");
    friends.forEach(friend => {
        console.log(friend.id, friend.firstName, friend.lastName, friend.status);
    });
};

const main = async () => {
    await getProfile();
    await saveProfile();
    await updateProfile();
    await queryFriendsAndRequests();
    await queryFriends();
    await queryRequests();
    await requestFriend();
    await acceptFriend();
    await queryFriendsAndRequestsLimitOffset();
    await db.end();
};

main();