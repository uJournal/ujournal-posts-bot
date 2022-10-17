const axios = require("axios");

const signInLemmy = async (usernameOrEmail, password) => {
  const url = `https://${process.env.LEMMY_HOST}/api/v3/user/login`;

  const response = await axios.post(url, {
    username_or_email: usernameOrEmail,
    password,
  });

  return response.data;
};

const fetchLemmyPosts = async (auth) => {
  const url = `https://${process.env.LEMMY_HOST}/api/v3/post/list?type_=All&sort=TopDay&page=1&limit=20&saved_only=false&auth=${auth.jwt}`;

  const response = await axios.get(url);

  return response.data;
};

const sendTgMessage = async (message, tgChatId, tgAuth) => {
  const url = `https://api.telegram.org/bot${tgAuth.token}/sendMessage`;

  const response = await axios.post(url, {
    chat_id: tgChatId,
    parse_mode: "Markdown",
    text: message,
  });

  return response.data;
};

const buildTgMessageFromPosts = async ({ posts }) => {
  return posts
    .filter(({ post }) => post.name.split(" ").length > 2)
    .slice(0, 10)
    .sort((a, b) => b.counts.comments - a.counts.comments)
    .map(({ post, counts }) => {
      return `• [${post.name}](${process.env.SITE_BASE_URL}/post/?postId=${
        post.id
      })${counts.comments ? ` 💬 ${counts.comments}` : ""}`;
    })
    .join("\n");
};

const main = async () => {
  // login and get Lemmy API auth
  const lemmyAuth = await signInLemmy(
    process.env.LEMMY_USERNAME_OR_EMAIL,
    process.env.LEMMY_PASSWORD
  );

  // build tgAuth
  const tgAuth = { token: process.env.TG_BOT_TOKEN };

  // fetch posts from Lemmy API
  const posts = await fetchLemmyPosts(lemmyAuth);

  // build Telegram message
  const message = await buildTgMessageFromPosts(posts);

  // send message to Telegram Channel
  sendTgMessage(message, process.env.TG_CHAT_ID, tgAuth);
};

module.exports = { main };
