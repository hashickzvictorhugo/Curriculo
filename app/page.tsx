import { NexoCVApp } from "./components/NexoCVApp";
import {
  chatGPTSignInPath,
  chatGPTSignOutPath,
  getChatGPTUser,
} from "./chatgpt-auth";
import { isAdminUser } from "../lib/admin-auth";
import { getPublicSiteSettings } from "../lib/site-settings.server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [user, settings] = await Promise.all([
    getChatGPTUser(),
    getPublicSiteSettings(),
  ]);
  const userIsAdmin = await isAdminUser(user);

  return (
    <NexoCVApp
      user={user ? { displayName: user.displayName, email: user.email } : null}
      signInPath={chatGPTSignInPath("/")}
      signOutPath={chatGPTSignOutPath("/")}
      initialConfig={settings.config}
      configRevision={settings.revision}
      isAdmin={userIsAdmin}
    />
  );
}
