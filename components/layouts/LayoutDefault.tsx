import { Base } from "components/ui/Base"
import { Card } from "components/ui/Card"
import { Container } from "components/ui/Container"
import RenewUsFooter from "components/ui/RenewUsFooter"
import RenewUsHeader from "components/ui/RenewUsHeader"
import { capitalizeWords } from "components/utils/typography"
import { useTranslation } from "react-i18next"
import styled from "styled-components"
import tw from "twin.macro"

interface Props {
  aside: ChildrenType
  main: ChildrenType
  partnerHeaderLogo?: HeaderLogo
  partnerName?: string
}

export const LayoutDefault: React.FC<Props> = ({
  main,
  aside,
  partnerHeaderLogo,
  partnerName,
}) => {
    const { t } = useTranslation()
    const footerCopyrightMessage = t("general.renewUsCopyright", {
        partnerName: capitalizeWords(partnerName ?? ''),
        year: new Date().getFullYear(),
    })

  return (
    <Base>
      <Container>
        <Wrapper>
          <Aside>
            {aside}
            <RenewUsFooter copyright={footerCopyrightMessage} />
          </Aside>
          <Main>
            {partnerHeaderLogo?.image && (
              <RenewUsHeader logo={{ ...partnerHeaderLogo }} />
            )}
            <Card $fullHeight>{main}</Card>
          </Main>
        </Wrapper>
      </Container>
    </Base>
  )
}

const Wrapper = styled.div`
  ${tw`flex flex-wrap justify-end items-stretch flex-col min-h-full md:h-screen md:flex-row`}
`

const Main = styled.div`
  ${tw`flex-none md:flex-1 justify-center order-first md:order-last`}
`

const Aside = styled.div`
  ${tw`flex-none md:flex-1`}
`
