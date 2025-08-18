import classNames from "classnames"
import { AccordionContext } from "components/data/AccordionProvider"
import { AppContext } from "components/data/AppProvider"
import { type ReactNode, useContext } from "react"
import styled from "styled-components"
import tw from "twin.macro"

interface Props {
  index: number
  header: ReactNode
  children?: JSX.Element[] | JSX.Element
}

export const Accordion = ({ children }: { children?: ChildrenType }) => {
  return <Wrapper>{children}</Wrapper>
}

export const AccordionItem = ({ children, index, header }: Props) => {
  const ctx = useContext(AccordionContext)
  const appCtx = useContext(AppContext)

  if (!ctx || !appCtx) return null

  const handleSelection = () => {
    return ctx.isActive ? ctx.closeStep() : ctx.setStep()
  }

  return (
    <AccordionTab
      tabIndex={index}
      className={classNames("group", {
        active: ctx.isActive,
        disabled: ctx.status === "disabled" || ctx.status === "skip",
      })}
    >
      <AccordionTabHeader
        data-testid={`accordion_${ctx.step.toLocaleLowerCase()}`}
        className="group"
        onClick={handleSelection}
      >
        <AccordionTitle>{header}</AccordionTitle>
      </AccordionTabHeader>
      <AccordionBody>{children}</AccordionBody>
    </AccordionTab>
  )
}

const Wrapper = styled.div`
  ${tw`-mx-5 md:-mx-0`}
`
const AccordionTab = styled.div`
  ${tw`outline-none bg-white shadow-bottom mb-2 px-5 md:px-0 md:mb-0 md:shadow-none md:border-b`}

  &[tabindex='3'] {
    ${tw`md:mb-5`}
  }
`
const AccordionTabHeader = styled.div`
  ${tw`text-brand-dark relative flex items-start justify-between pb-3 pt-5 transition ease-in-out duration-100 focus:bg-gray-400 md:pt-6 md:pb-0`}
  .disabled & {
    ${tw`pointer-events-none`}
  }
`
const AccordionTitle = styled.div`
  ${tw`transition ease-in-out duration-100`}
`

const AccordionBody = styled.div`
  ${tw`max-h-0 transition duration-100 ease-in opacity-0`}
  .active & {
    ${tw`max-h-full opacity-100`}
  }

  .disabled & {
    ${tw`max-h-0 opacity-0`}
  }
`
