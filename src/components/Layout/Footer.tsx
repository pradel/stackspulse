import { appConfig } from "@/appConfig";
import { Container, IconButton } from "@radix-ui/themes";
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";

export const Footer = () => {
  return (
    <footer>
      <Container size="2" className="px-4 py-10">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-5">
            <IconButton size="2" color="gray" variant="ghost" asChild>
              <a href={appConfig.twitter} target="_blank" rel="noreferrer">
                <IconBrandGithub size={16} />
              </a>
            </IconButton>
            <IconButton size="2" color="gray" variant="ghost" asChild>
              <a href={appConfig.github} target="_blank" rel="noreferrer">
                <IconBrandX size={16} />
              </a>
            </IconButton>
          </div>
        </div>
      </Container>
    </footer>
  );
};
